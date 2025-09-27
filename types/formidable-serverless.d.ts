declare module 'formidable-serverless' {
  import { IncomingMessage } from 'http';
  import { EventEmitter } from 'events';

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Fields {
    [key: string]: any;
  }

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
  }

  export interface Options {
    multiples?: boolean;
    uploadDir?: string;
    keepExtensions?: boolean;
  }

  export default class Formidable extends EventEmitter {
    constructor(options?: Options);
    parse(req: IncomingMessage): Promise<{ fields: Fields; files: Files }>;
  }
}

