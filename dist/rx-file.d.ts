import { VFile } from 'vfile';
export declare function listFiles(globPattern: string): string[];
export declare function read(charset?: string): (path: string) => VFile;
export declare function write(file: VFile): (contents: string) => void;
