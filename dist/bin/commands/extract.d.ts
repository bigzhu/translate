import { CommandBuilder } from 'yargs';
import { TranslationEngineType } from '../../common';
export declare const command = "extract <sourceGlob> [outFile]";
export declare const describe = "\u63D0\u53D6\u7FFB\u8BD1\u5BF9";
export declare const builder: CommandBuilder;
interface ExtractParams {
    sourceGlob: string;
    outFile: string;
    unique: boolean;
    outType: TranslationEngineType;
    pattern: RegExp;
}
export declare const handler: ({ sourceGlob, outFile, unique, outType, pattern }: ExtractParams) => import("rxjs").Subscription;
export {};
