import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  addTranslationMark,
  checkCharset,
  injectTranslators,
  listFiles,
  parse,
  read,
  replaceResourceUrls,
  stringify,
  write,
} from './trans-kit';
import { map, switchMap, tap, toArray } from 'rxjs/operators';
import { of } from 'rxjs';
import { extractAll } from './html';

describe('trans-kit', function () {
  it('translate', () => {
    const styleUrls = ['/assets/css/translator.css'];
    const scriptUrls = ['/assets/js/translator.js'];
    const urlMap = {
      'https://fonts.googleapis.com/icon?family=Material+Icons': '/assets/css/Material_Icons.css',
      'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,700': '/assets/css/Material_Icons.css',
    };
    return listFiles(exampleGlob).pipe(
      map(read()),
      switchMap(file => of(file).pipe(
        map(parse()),
        tap(checkCharset()),
        tap(addTranslationMark()),
        tap(injectTranslators(styleUrls, scriptUrls)),
        tap(replaceResourceUrls(urlMap)),
        map(stringify()),
        tap(write(file)),
      )),
    ).toPromise();
  });
  it('extract all', () => {
    return listFiles(exampleGlob).pipe(
      map(read()),
      switchMap(file => of(file).pipe(
        map(parse()),
        tap(addTranslationMark()),
        map(dom => extractAll(dom.window.document.body)),
        map(pairs => pairs.map(pair => `${pair.english}\t${pair.chinese}`)),
      )),
      toArray(),
      tap((result) => expect(result).eql([
        [
          '<a href="/search">Search <i class="icon icon-search"></i></a>\t<a href="/search">搜索 <i class="icon icon-search"></i></a>',
        ],
        [
          'Handling errors\t错误处理',
          'Writing file contents\t编写文件内容',
        ],
        [],
        [],
      ])),
    ).toPromise();
  });
});

const exampleGlob = __dirname + '/test/samples/**/*.html';
