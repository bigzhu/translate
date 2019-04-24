import { Observable } from 'rxjs';
import { TranslationEngineType } from './common';
export declare abstract class TranslationEngine {
    abstract translate(text: string): Observable<string>;
}
export declare function getTranslateEngine(engine: TranslationEngineType): TranslationEngine;
