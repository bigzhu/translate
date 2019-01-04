import { describe, it } from 'mocha';
import { addTranslationMark, handleHtmlFiles, injectTranslators, replaceResourceUrls } from './trans-kit';

describe('trans-kit', function () {
  it('translate', () => {
    handleHtmlFiles(__dirname + '/test/samples/**/*.html', 'utf-8', (doc) => {
      addTranslationMark(doc);
      injectTranslators(doc, ['/assets/css/translator.css'], ['/assets/js/translator.js']);
      replaceResourceUrls(doc, {
        'https://fonts.googleapis.com/icon?family=Material+Icons': '/assets/css/Material_Icons.css',
        'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,700': '/assets/css/Material_Icons.css',
      });
    });
  });
});
