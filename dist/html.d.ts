export declare namespace html {
    const defaultSelectors: string[];
    interface SentencePair {
        english: Element;
        chinese: Element;
    }
    function addIdForHeaders(body: HTMLElement): void;
    function markAndSwapAll(body: HTMLElement, selectors?: string[]): void;
    function extractAll(body: HTMLElement): SentencePair[];
    function markAndSwap(element: Element, selector: string): void;
    function restructureTable(element: Element): void;
}
