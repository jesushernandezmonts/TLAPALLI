// Augment Express namespace to include Multer types
// Required because @types/express v5 removed the Multer namespace
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
      destination?: string;
      filename?: string;
      path?: string;
      stream?: any;
    }
  }
}
