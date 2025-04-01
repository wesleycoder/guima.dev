import type {
  CompleteResourceTemplateCallback,
  ListResourcesCallback,
  ReadResourceTemplateCallback,
  ToolCallback,
} from '@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts'
import type { z, ZodRawShape } from 'zod'

declare global {
  // deno-lint-ignore ban-types
  type ToolParams<T extends ZodRawShape = {}> = z.infer<z.ZodObject<T>>

  // deno-lint-ignore ban-types
  type TMDBTool<Params extends ZodRawShape = {}> = Pretty<{
    name: string
    description: string
    paramsSchema: Params
    examplePayload: ToolParams<Params>
    callback: ToolCallback<Params>
  }>

  export type TMDBResource = Pretty<{
    name: string
    uri: string
    description: string
    mimeType: string
    list: ListResourcesCallback
    complete: Record<string, CompleteResourceTemplateCallback>
    callback: ReadResourceTemplateCallback
  }>
}

export {}
