import { CommandBuilder } from 'yargs';
export declare const command = "mark <sourceGlob>";
export declare const describe = "\u4E3A\u53CC\u8BED HTML \u6587\u4EF6\u505A\u540E\u671F\u5904\u7406\uFF0C\u6839\u636E\u8BED\u79CD\u52A0\u4E0A\u7FFB\u8BD1\u6807\u8BB0";
export declare const builder: CommandBuilder;
interface Params {
    sourceGlob: string;
}
export declare const handler: ({ sourceGlob }: Params) => import("rxjs").Subscription;
export {};
