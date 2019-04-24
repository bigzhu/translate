import { CommandBuilder } from 'yargs';
export declare const command = "inject <sourceGlob>";
export declare const describe = "\u4E3A\u53CC\u8BED HTML \u6587\u4EF6\u505A\u540E\u671F\u5904\u7406\uFF0C\u6CE8\u5165\u7FFB\u8BD1\u5DE5\u5177";
export declare const builder: CommandBuilder;
interface Params {
    sourceGlob: string;
    styleUrls: string[];
    scriptUrls: string[];
    urlMap: Record<string, string>;
    textMap: Record<string, string>;
}
export declare const handler: ({ sourceGlob, styleUrls, scriptUrls, urlMap, textMap }: Params) => import("rxjs").Subscription;
export {};
