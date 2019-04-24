import { VFileCompatible } from 'unified';
import { Node } from 'unist';
import { Observable } from 'rxjs';
import { TranslationEngine } from './engine';
export declare namespace markdown {
    function parse(markdown: VFileCompatible): Node;
    function stringify(tree: Node): string;
    function mdToHtml(ast: Node): string;
    function htmlToMd(html: string): Node;
    function translate(tree: Node, engine: TranslationEngine): Observable<Node>;
}
