import { Observable } from 'rxjs';
import { VFile } from 'vfile';
import { TranslationEngine } from './engine';
import { TranslationEngineType } from './common';
export declare class TranslationKit {
    private selectors;
    private engine;
    constructor(engine: TranslationEngine | TranslationEngineType, selectors?: string[]);
    transformFiles(sourceGlob: string, transformer: (file: VFile) => Observable<VFile>): Observable<VFile>;
    translateFile(file: VFile): Observable<VFile>;
    translateHtml(file: VFile): Observable<VFile>;
    translateMarkdown(file: VFile): Observable<VFile>;
    translateFiles(sourceGlob: string): Observable<VFile>;
    translateElement(element: Element): Observable<string>;
    translateDoc(doc: Document): Observable<Document>;
    extractTrainingDataset(sourceGlob: string, unique?: boolean): Observable<{
        english: string;
        chinese: string;
    }>;
    extractLowQualifyResults(sourceGlob: string): Observable<string>;
}
export declare function injectTranslationKitToDoc(doc: HTMLDocument, styleUrls: string[], scriptUrls: string[], urlMap: Record<string, string>): void;
export declare function injectTranslationKit(sourceGlob: string, styleUrls: string[], scriptUrls: string[], urlMap: Record<string, string>, textMap: Record<string, string>): Observable<VFile>;
export declare function addTranslationMarks(sourceGlob: string): Observable<VFile>;
