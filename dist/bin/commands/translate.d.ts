import { CommandBuilder } from 'yargs';
import { TranslationEngineType } from '../../common';
export declare const command = "translate <sourceGlob>";
export declare const describe = "\u81EA\u52A8\u7FFB\u8BD1 sourceGlob \u4E2D\u7684\u6587\u4EF6\uFF0C\u652F\u6301 html \u548C markdown \u4E24\u79CD\u683C\u5F0F";
export declare const builder: CommandBuilder;
interface Params {
    sourceGlob: string;
    engine: TranslationEngineType;
}
export declare const handler: ({ sourceGlob, engine }: Params) => import("rxjs").Subscription;
export {};
