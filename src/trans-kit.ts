import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync } from 'fs';
import * as globby from 'globby';
import { addIdForHeaders, markAndSwapAll } from './html';

declare interface TranslationHandler {
  (doc: HTMLDocument): void;
}

export function handleHtmlFiles(dir: string, charset = 'utf-8', docHandler: TranslationHandler): void {
  globby.sync(dir).forEach(file => {
    const content = readFileSync(file, charset);
    const dom = new JSDOM(content);
    const doc = dom.window.document;
    if (doc.charset !== charset.toUpperCase()) {
      throw new Error(`The charset of HTML file "${file}" must be '${charset}'`);
    }
    docHandler(doc);
    writeFileSync(file, dom.serialize(), charset);
  });
}

export function addTranslationMark(doc: HTMLDocument): void {
  const body = doc.body;
  addIdForHeaders(body);
  markAndSwapAll(body);
}

function styleSheetExists(styleSheets: NodeListOf<HTMLLinkElement>, styleSheetUrl: string): boolean {
  for (let i = 0; i < styleSheets.length; ++i) {
    if (styleSheets.item(i)!.href === styleSheetUrl) {
      return true;
    }
  }
  return false;
}

function scriptExists(scripts: NodeListOf<HTMLScriptElement>, scriptUrl: string): boolean {
  for (let i = 0; i < scripts.length; ++i) {
    if (scripts.item(i)!.src === scriptUrl) {
      return true;
    }
  }
  return false;
}

function styleSheetsOf(doc: HTMLDocument): NodeListOf<HTMLLinkElement> {
  return doc.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]');
}

function scriptsOf(doc: HTMLDocument): NodeListOf<HTMLScriptElement> {
  return doc.querySelectorAll<HTMLScriptElement>('script[src]');
}

export function injectTranslators(doc: HTMLDocument, styleUrls: string[] = [], scriptUrls: string[] = []): void {
  styleUrls.forEach(styleUrl => {
    if (styleSheetExists(styleSheetsOf(doc), styleUrl)) {
      return;
    }
    const link = doc.createElement('link');
    link.href = styleUrl;
    link.rel = 'stylesheet';
    doc.head.appendChild(link);
  });
  scriptUrls.forEach(scriptUrl => {
    if (scriptExists(scriptsOf(doc), scriptUrl)) {
      return;
    }
    const script = doc.createElement('script');
    script.src = scriptUrl;
    doc.body.appendChild(script);
  });
}

export function replaceResourceUrls(doc: HTMLDocument, urlMap: { [key: string]: string }): void {
  styleSheetsOf(doc).forEach(styleSheet => {
    const newValue = urlMap[styleSheet.href];
    if (newValue) {
      styleSheet.href = newValue;
    }
  });
  scriptsOf(doc).forEach(script => {
    const newValue = urlMap[script.src];
    if (newValue) {
      script.src = newValue;
    }
  });
  doc.querySelectorAll<HTMLImageElement>('img[src]').forEach(image => {
    const newValue = urlMap[image.src];
    if (newValue) {
      image.src = newValue;
    }
  });
}

