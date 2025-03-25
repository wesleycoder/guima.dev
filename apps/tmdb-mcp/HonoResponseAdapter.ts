import { randomUUID } from "node:crypto"

// Adapter class for Hono response to make it compatible with SSEServerTransport
export class HonoResponseAdapter {
  private writer: WritableStreamDefaultWriter<Uint8Array>
  private encoder = new TextEncoder()
  private onCloseHandlers: Array<() => void> = []
  private _sessionId = randomUUID()

  constructor(writer: WritableStreamDefaultWriter<Uint8Array>) {
    this.writer = writer

    // Handle writer closing
    writer.closed.then(() => {
      this.onCloseHandlers.forEach((handler) => handler())
    }).catch(() => {
      this.onCloseHandlers.forEach((handler) => handler())
    })
  }

  get sessionId() {
    return this._sessionId
  }

  writeHead(_statusCode: number, _headers: Record<string, string>): this {
    return this
  }

  write(data: string): boolean {
    try {
      this.writer.write(this.encoder.encode(data))
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  on(event: string, handler: () => void): this {
    if (event === "close") {
      this.onCloseHandlers.push(handler)
    }
    return this
  }

  end(data?: string): this {
    if (data) {
      this.write(data)
    }
    return this
  }
}
