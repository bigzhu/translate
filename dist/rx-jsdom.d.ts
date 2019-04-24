import { VFile } from 'vfile';
import { JSDOM } from 'jsdom';
export declare function parse(): (file: VFile) => JSDOM;
export declare function stringify(): (JSDOM: any) => string;
