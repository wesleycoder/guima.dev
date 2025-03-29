import { env } from '#/env.ts'
import { HonoResponseAdapter } from '#/HonoResponseAdapter.ts'
import { resources } from '#/resources/index.ts'
import { methods, tools } from '#/tools/index.ts'
import { Hono } from '@hono/hono'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

export const app = new Hono()

app.get('/', (c) => {
  return c.html(`
    <style>*{background-color: #222;color: #fff;}:visited{color:#a0a0a0;}</style>
    <ul>
      <li><a href='/sse'>/sse</a></li>
      <li><a href='/status'>/status</a></li>
      <li><a href='/methods'>/methods</a></li>
      <li><a href='/resources'>/resources</a></li>
    </ul>
  `)
})

export let isServerReady = false

export const activeTransports = new Map<string, SSEServerTransport>()
export const activeServers = new Map<string, McpServer>()

async function deleteTransport(sessionId: string) {
  const transport = activeTransports.get(sessionId)
  if (transport) await transport.close()
  activeTransports.delete(sessionId)
}

async function deleteServer(sessionId: string) {
  const server = activeServers.get(sessionId)
  if (server) await server.close()
  activeServers.delete(sessionId)
}

const getMcpServer = () => {
  const mcpServer = new McpServer({
    name: 'tmdb-mcp-server',
    version: '1.0.0',
    capabilities: {
      resources: {
        subscribe: true, // Support resource subscriptions
        listChanged: true, // Support list changed notifications
      },
    },
  })

  tools.forEach(({ name, description, paramsSchema, callback }) => {
    mcpServer.tool(name, description, paramsSchema, callback)
  })

  resources.forEach(({ name, uri, list, complete, callback, ...metadata }) => {
    mcpServer.resource(
      name,
      new ResourceTemplate(uri, { list, complete }),
      metadata,
      callback,
    )
  })

  return mcpServer
}

app.get('/sse', async (c) => {
  try {
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    // deno-lint-ignore no-explicit-any
    const adapter = new HonoResponseAdapter(writer) as any
    const transport = new SSEServerTransport('/messages', adapter)

    try {
      const mcpServer = getMcpServer()
      await mcpServer.connect(transport)
      isServerReady = true

      const query = new URL(c.req.url).searchParams
      const isDev = env.isDev && query.has('sessionId')
      const sessionId = isDev ? query.get('sessionId')! : transport.sessionId

      activeTransports.set(sessionId, transport)
      activeServers.set(sessionId, mcpServer)

      writer.closed.catch(async () => {
        await deleteTransport(sessionId)
        await deleteServer(sessionId)
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error: unknown) {
      console.error(error)
      return c.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
    }
  } catch (error) {
    console.error(error)
    return c.text(`SSE setup error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
  }
})

app.post('/messages', async (c) => {
  const sessionId = new URL(c.req.url).searchParams.get('sessionId')

  if (!sessionId) {
    return c.text('Missing sessionId parameter', 400)
  }

  const transport = activeTransports.get(sessionId)

  if (!transport) {
    return c.text('Invalid or expired session', 404)
  }

  const msg = await c.req.json()

  if (env.isDev && typeof msg === 'object' && msg !== null) {
    console.info(
      `%c[${sessionId}] ${msg.method}:\n%c${JSON.stringify(msg.params, null, 2)}`,
      'color: #0ff; font-weight: bold;',
      'color: #42ff42',
    )
  }

  await transport.handleMessage(msg)

  return c.text('Accepted', 202)
})

app.get('/status', (c) => {
  return c.json({
    name: 'TMDB MCP Server',
    version: '0.0.1',
    endpoints: {
      sse: '/sse',
      messages: '/messages',
      status: '/status',
      methods: '/methods',
      resources: '/resources',
    },
    status: isServerReady ? 'ready' : 'initializing',
    availableTools: methods.map((method) => method.name),
    availableResources: Array.from(resources.keys()),
    activeConnections: activeTransports.size,
  })
})

app.get('/methods', (c) => c.json({ methods }))

app.get('/resources', (c) => {
  const resourcesList = Array.from(resources.entries()).map(([name, resource]) => ({
    name,
    uri: resource.uri,
    description: resource.description,
    mimeType: resource.mimeType,
  }))

  return c.json({ resources: resourcesList })
})

app.on('close', ['*'], async (c) => {
  isServerReady = false
  await shutdown('SERVER_CLOSE')
  return c.text('Server is shutting down', 200)
})

const controller = new AbortController()

async function shutdown(signal: string) {
  console.warn(`\n${signal} received. Shutting down gracefully...`)
  isServerReady = false

  await Promise.all(
    Array.from(activeTransports.keys()).map(async (sessionId) => {
      await deleteTransport(sessionId)
      await deleteServer(sessionId)
    }),
  )

  activeTransports.clear()
  activeServers.clear()
  controller.abort()
  console.warn('Shutdown complete.')
}

if (import.meta.main) {
  try {
    Deno.serve({
      port: env.PORT,
      hostname: '0.0.0.0',
      signal: controller.signal,
      onListen: ({ port }) => console.info(`Started server on port ${port}`),
    }, app.fetch)

    if (env.isDev) {
      globalThis.addEventListener('unload', async () => await shutdown('SERVER_UNLOAD'))
    } else {
      Deno.addSignalListener('SIGINT', async () => await shutdown('SIGINT'))
      Deno.addSignalListener('SIGTERM', async () => await shutdown('SIGTERM'))
      Deno.addSignalListener('SIGQUIT', async () => await shutdown('SIGQUIT'))
    }
  } catch (error: unknown) {
    if (error instanceof Deno.errors.Interrupted) {
      await shutdown('SERVER_INTERRUPT')
    }
    console.error('Startup error:', error)
    Deno.exit(1)
  }
}
