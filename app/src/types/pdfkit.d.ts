declare module "pdfkit" {
  import type { Readable } from "node:stream";

  export default class PDFDocument extends Readable {
    constructor(options?: Record<string, unknown>);
    fontSize(size: number): this;
    text(
      text: string,
      options?: Record<string, unknown>,
    ): this;
    moveDown(lines?: number): this;
    on(event: "data", listener: (chunk: Buffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    end(): void;
  }
}
