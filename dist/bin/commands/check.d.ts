import { CommandBuilder } from 'yargs';
import { TranslationEngineType } from '../../common';
export declare const command = "check <sourceGlob>";
export declare const describe = "\u6839\u636E\u4E2D\u82F1\u5B57\u7B26\u4E32\u957F\u5EA6\u7C97\u7565\u68C0\u67E5\u7FFB\u8BD1\u7ED3\u679C";
export declare const builder: CommandBuilder;
interface CheckParams {
    sourceGlob: string;
    engine: TranslationEngineType;
}
export declare const handler: ({ sourceGlob, engine }: CheckParams) => import("rxjs").Subscription;
export {};
