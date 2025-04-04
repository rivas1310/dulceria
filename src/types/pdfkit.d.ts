declare module 'pdfkit' {
  export default class PDFDocument {
    constructor(options?: any);
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    moveDown(): this;
    on(event: string, callback: Function): this;
    end(): void;
    y: number;
  }
} 