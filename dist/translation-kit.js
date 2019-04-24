"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_1 = require("./html");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var engine_1 = require("./engine");
var rx_file_1 = require("./rx-file");
var rx_jsdom_1 = require("./rx-jsdom");
var common_1 = require("./common");
var markdown_1 = require("./markdown");
var extractAll = html_1.html.extractAll;
var defaultSelectors = html_1.html.defaultSelectors;
var addIdForHeaders = html_1.html.addIdForHeaders;
var markAndSwapAll = html_1.html.markAndSwapAll;
var TranslationKit = /** @class */ (function () {
    function TranslationKit(engine, selectors) {
        if (selectors === void 0) { selectors = defaultSelectors; }
        this.selectors = selectors;
        if (engine instanceof engine_1.TranslationEngine) {
            this.engine = engine;
        }
        else {
            this.engine = engine_1.getTranslateEngine(engine);
        }
    }
    TranslationKit.prototype.transformFiles = function (sourceGlob, transformer) {
        var tasks = rx_file_1.listFiles(sourceGlob).map(function (filename) { return rxjs_1.of(filename).pipe(operators_1.map(rx_file_1.read()), operators_1.switchMap(function (file) { return transformer(file); })); });
        return rxjs_1.concat.apply(void 0, tasks);
    };
    TranslationKit.prototype.translateFile = function (file) {
        console.log('translating: ', file.path);
        switch (file.extname) {
            case '.html':
            case '.htm':
                return this.translateHtml(file);
            case '.md':
            case '.markdown':
                return this.translateMarkdown(file);
            default:
                throw new Error('Unsupported file type');
        }
    };
    TranslationKit.prototype.translateHtml = function (file) {
        var _this = this;
        return rxjs_1.of(file).pipe(operators_1.map(rx_jsdom_1.parse()), operators_1.switchMap(function (dom) { return rxjs_1.of(dom).pipe(operators_1.map(function (dom) { return dom.window.document; }), operators_1.tap(checkCharset()), operators_1.switchMap(function (doc) { return _this.translateDoc(doc); }), operators_1.mapTo(dom)); }), operators_1.map(function (dom) { return dom.serialize(); }), operators_1.tap(function (html) { return file.contents = html; }), operators_1.mapTo(file));
    };
    TranslationKit.prototype.translateMarkdown = function (file) {
        var ast = markdown_1.markdown.parse(file.contents);
        return markdown_1.markdown.translate(ast, this.engine).pipe(operators_1.map(function (ast) { return markdown_1.markdown.stringify(ast); }), operators_1.tap(function (md) { return file.contents = md; }), operators_1.mapTo(file));
    };
    TranslationKit.prototype.translateFiles = function (sourceGlob) {
        var _this = this;
        return this.transformFiles(sourceGlob, function (file) { return _this.translateFile(file); });
    };
    TranslationKit.prototype.translateElement = function (element) {
        if (shouldIgnore(element)) {
            return rxjs_1.of(element.innerHTML);
        }
        return this.engine.translate(element.innerHTML).pipe(operators_1.tap(function (result) {
            var resultNode = element.ownerDocument.createElement(element.tagName);
            resultNode.innerHTML = result;
            element.parentElement.insertBefore(resultNode, element);
            // 交换 id
            var id = element.getAttribute('id');
            if (id) {
                resultNode.setAttribute('id', id);
                element.removeAttribute('id');
            }
            resultNode.setAttribute('translation-result', 'on');
            element.setAttribute('translation-origin', 'off');
        }));
    };
    TranslationKit.prototype.translateDoc = function (doc) {
        var _this = this;
        var translateTitleTask = this.engine.translate(doc.title).pipe(operators_1.tap(function (title) { return doc.title = title; }));
        var elements = this.selectors.map(function (selector) { return Array.from(doc.querySelectorAll(selector)); })
            .reduce(function (result, item) { return result.concat(item); });
        var translateElementTasks = elements.map(function (element) { return _this.translateElement(element); });
        var tasks = [
            translateTitleTask
        ].concat(translateElementTasks);
        return rxjs_1.concat.apply(void 0, tasks).pipe(operators_1.tap(function (items) { return items; }), operators_1.toArray(), operators_1.mapTo(doc));
    };
    TranslationKit.prototype.extractTrainingDataset = function (sourceGlob, unique) {
        if (unique === void 0) { unique = false; }
        var tasks = rx_file_1.listFiles(sourceGlob).map(function (filename) { return rxjs_1.of(filename).pipe(operators_1.map(rx_file_1.read()), operators_1.switchMap(function (file) { return rxjs_1.of(file).pipe(operators_1.map(rx_jsdom_1.parse()), operators_1.map(function (dom) { return dom.window.document; }), operators_1.tap(checkCharset()), operators_1.map(function (doc) { return extractAll(doc.body); }), operators_1.flatMap(function (pairs) { return pairs; }), operators_1.map(function (_a) {
            var english = _a.english, chinese = _a.chinese;
            return ({ english: textOf(english), chinese: textOf(chinese) });
        }), operators_1.filter(function (_a) {
            var chinese = _a.chinese;
            return countOfChinese(chinese) > 4;
        })); }), unique ? operators_1.distinct() : operators_1.tap()); });
        return rxjs_1.concat.apply(void 0, tasks);
    };
    TranslationKit.prototype.extractLowQualifyResults = function (sourceGlob) {
        var tasks = rx_file_1.listFiles(sourceGlob).map(function (file) { return rxjs_1.of(file).pipe(operators_1.map(rx_file_1.read()), operators_1.switchMap(function (file) { return rxjs_1.of(file).pipe(operators_1.map(rx_jsdom_1.parse()), operators_1.map(function (dom) { return dom.window.document; }), operators_1.tap(checkCharset()), operators_1.map(function (doc) { return extractAll(doc.body); }), operators_1.flatMap(function (pairs) { return pairs; }), operators_1.distinct(), operators_1.map(function (_a) {
            var english = _a.english, chinese = _a.chinese;
            return ({ english: textOf(english), chinese: textOf(chinese) });
        }), operators_1.filter(function (_a) {
            var english = _a.english, chinese = _a.chinese;
            return chinese.indexOf(english) === -1 && // 排除中文完全包含英文的
                countOfChinese(chinese) >= 10 && // 中文字符数必须大于 10
                ((english.length > chinese.length * 4 || english.length < chinese.length) || // 英文长度和中文长度比例过大或过小
                    wordCount(english, 'angular') !== wordCount(chinese, 'angular')); // 中文和英文中包含的 Angular 个数不一样
        }), operators_1.map(function (_a) {
            var english = _a.english, chinese = _a.chinese;
            return english + "(" + english.length + ")\t|\t" + chinese + "(" + chinese.length + ")";
        })); })); });
        return rxjs_1.concat.apply(void 0, tasks);
    };
    return TranslationKit;
}());
exports.TranslationKit = TranslationKit;
function checkCharset(charset) {
    if (charset === void 0) { charset = 'utf-8'; }
    return function (doc) { return doc.charset !== charset.toUpperCase(); };
}
function wordCount(text, word) {
    var count = 0;
    for (var i = 0; i < text.length; ++i) {
        if (text.slice(i, i + word.length).toLowerCase() === word) {
            ++count;
        }
    }
    return count;
}
function countOfChinese(chinese) {
    var count = 0;
    for (var i = 0; i < chinese.length; ++i) {
        var code = chinese.charCodeAt(i);
        if (code >= 0x4e00 && code <= 0x9fa5) {
            ++count;
        }
    }
    return count;
}
function injectTranslationKitToDoc(doc, styleUrls, scriptUrls, urlMap) {
    injectTranslators(doc, styleUrls, scriptUrls);
    replaceResourceUrls(doc, urlMap);
}
exports.injectTranslationKitToDoc = injectTranslationKitToDoc;
function injectTranslationKit(sourceGlob, styleUrls, scriptUrls, urlMap, textMap) {
    var tasks = rx_file_1.listFiles(sourceGlob).map(function (filename) { return rxjs_1.of(filename).pipe(operators_1.map(rx_file_1.read()), operators_1.switchMap(function (file) { return rxjs_1.of(file).pipe(operators_1.map(rx_jsdom_1.parse()), operators_1.switchMap(function (dom) { return rxjs_1.of(dom).pipe(operators_1.map(function (dom) { return dom.window.document; }), operators_1.tap(checkCharset()), operators_1.tap(function (doc) { return injectTranslationKitToDoc(doc, styleUrls, scriptUrls, urlMap); }), operators_1.mapTo(dom)); }), operators_1.map(function (dom) { return dom.serialize(); }), operators_1.map(function (html) { return replaceText(html, textMap); }), operators_1.tap(function (html) { return file.contents = html; }), operators_1.mapTo(file)); })); });
    return rxjs_1.concat.apply(void 0, tasks);
}
exports.injectTranslationKit = injectTranslationKit;
function replaceText(text, textMap) {
    Object.entries(textMap).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        text = text.replace(new RegExp(key, 'gi'), value);
    });
    return text;
}
function addTranslationMarks(sourceGlob) {
    var tasks = rx_file_1.listFiles(sourceGlob).map(function (filename) { return rxjs_1.of(filename).pipe(operators_1.map(rx_file_1.read()), operators_1.switchMap(function (file) { return rxjs_1.of(file).pipe(operators_1.map(rx_jsdom_1.parse()), operators_1.switchMap(function (dom) { return rxjs_1.of(dom).pipe(operators_1.map(function (dom) { return dom.window.document; }), operators_1.tap(checkCharset()), operators_1.tap(function (doc) { return addTranslationMark(doc); }), operators_1.mapTo(dom)); }), operators_1.map(function (dom) { return dom.serialize(); }), operators_1.tap(function (html) { return file.contents = html; }), operators_1.mapTo(file)); })); });
    return rxjs_1.concat.apply(void 0, tasks);
}
exports.addTranslationMarks = addTranslationMarks;
function addTranslationMark(doc) {
    addIdForHeaders(doc.body);
    markAndSwapAll(doc.body);
}
function injectTranslators(doc, styleUrls, scriptUrls) {
    if (styleUrls === void 0) { styleUrls = []; }
    if (scriptUrls === void 0) { scriptUrls = []; }
    styleUrls.forEach(function (styleUrl) {
        if (styleSheetExists(styleSheetsOf(doc), styleUrl)) {
            return;
        }
        var link = doc.createElement('link');
        link.href = styleUrl;
        link.rel = 'stylesheet';
        doc.head.appendChild(link);
    });
    scriptUrls.forEach(function (scriptUrl) {
        if (scriptExists(scriptsOf(doc), scriptUrl)) {
            return;
        }
        var script = doc.createElement('script');
        script.src = scriptUrl;
        doc.body.appendChild(script);
    });
}
function replaceResourceUrls(doc, urlMap) {
    styleSheetsOf(doc).forEach(function (styleSheet) {
        var newValue = urlMap[styleSheet.href];
        if (newValue) {
            styleSheet.href = newValue;
        }
    });
    scriptsOf(doc).forEach(function (script) {
        var newValue = urlMap[script.src];
        if (newValue) {
            script.src = newValue;
        }
    });
    doc.querySelectorAll('img[src]').forEach(function (image) {
        var newValue = urlMap[image.src];
        if (newValue) {
            image.src = newValue;
        }
    });
}
function styleSheetExists(styleSheets, styleSheetUrl) {
    for (var i = 0; i < styleSheets.length; ++i) {
        if (styleSheets.item(i).href === styleSheetUrl) {
            return true;
        }
    }
    return false;
}
function scriptExists(scripts, scriptUrl) {
    for (var i = 0; i < scripts.length; ++i) {
        if (scripts.item(i).src === scriptUrl) {
            return true;
        }
    }
    return false;
}
function styleSheetsOf(doc) {
    return doc.querySelectorAll('link[rel=stylesheet]');
}
function scriptsOf(doc) {
    return doc.querySelectorAll('script[src]');
}
function textOf(node) {
    return node.textContent.trim().replace(/\s+/g, ' ');
}
function shouldIgnore(element) {
    return !!element.querySelector('[translation-result]') || common_1.containsChinese(element.textContent);
}
//# sourceMappingURL=translation-kit.js.map