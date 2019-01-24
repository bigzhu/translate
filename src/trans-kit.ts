import { JSDOM } from 'jsdom';
import * as globby from 'globby';
import { addIdForHeaders, markAndSwapAll } from './html';
import { from, Observable } from 'rxjs';
import * as vfile from 'to-vfile';
import { VFile } from 'vfile';

export function listFiles(globPattern: string): Observable<string> {
  const files = globby.sync(globPattern);
  return from(files);
}

export function read(charset = 'utf-8'): (string) => VFile {
  return (path) => vfile.readSync(path, charset);
}

export function parse(): (file: VFile) => JSDOM {
  return (file) => new JSDOM(file.contents);
}

export function stringify(): (JSDOM) => string {
  return (dom) => dom.serialize();
}

export function checkCharset(charset = 'utf-8'): (JSDOM) => void {
  return (dom) => dom.window.document.charset !== charset.toUpperCase();
}

export function write(file: VFile): (string) => void {
  return (contents) => {
    file.contents = contents;
    vfile.writeSync(file);
  };
}

export function addTranslationMark(): (JSDOM) => void {
  return (dom: JSDOM) => {
    const body = dom.window.document.body;
    addIdForHeaders(body);
    markAndSwapAll(body);
  };
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

export function injectTranslators(styleUrls: string[] = [], scriptUrls: string[] = []): (JSDOM) => void {
  return (dom: JSDOM) => {
    const doc = dom.window.document;
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
  };
}

export function replaceResourceUrls(urlMap: Record<string, string>): (JSDOM) => void {
  return (dom: JSDOM) => {
    const doc = dom.window.document;
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
  };
}

