"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var slugs = require("github-slugger");
var common_1 = require("./common");
var html;
(function (html) {
    html.defaultSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 't'];
    function toId(slugger, text) {
        return slugger.slug(text);
    }
    function addIdForHeaders(body) {
        var headers = body.querySelectorAll('h1,h2,h3,h4,h5,h6');
        var slugger = slugs();
        headers.forEach(function (header) {
            if (!header.hasAttribute('id')) {
                header.setAttribute('id', toId(slugger, header.textContent));
            }
        });
    }
    html.addIdForHeaders = addIdForHeaders;
    function markAndSwapAll(body, selectors) {
        if (selectors === void 0) { selectors = html.defaultSelectors; }
        restructureTable(body);
        selectors.forEach(function (selectors) { return markAndSwap(body, selectors); });
    }
    html.markAndSwapAll = markAndSwapAll;
    function clearAiraHidden(body) {
        var hiddens = body.querySelectorAll('[aria-hidden=true]');
        hiddens.forEach(function (element) { return element.remove(); });
    }
    function extractAll(body) {
        clearAiraHidden(body);
        var resultElements = body.querySelectorAll('[translation-result]+[translation-origin]');
        var results = [];
        resultElements.forEach(function (origin) {
            var result = origin.previousElementSibling;
            if (!common_1.containsChinese(origin.textContent)) {
                results.push({ english: origin, chinese: result });
            }
        });
        return results;
    }
    html.extractAll = extractAll;
    function isPaired(prev, element) {
        return prev && prev.nextElementSibling === element &&
            prev.tagName === element.tagName && prev.className === element.className;
    }
    function markAndSwap(element, selector) {
        var elements = element.querySelectorAll(selector);
        elements.forEach(function (element) {
            if (common_1.containsChinese(element.innerHTML)) {
                var prev = element.previousElementSibling;
                if (isPaired(prev, element) && !common_1.containsChinese(prev.innerHTML)) {
                    element.setAttribute('translation-result', 'off');
                    prev.setAttribute('translation-origin', 'on');
                    // 不要交换位置
                    // element.parentElement!.insertBefore(element, prev);
                    // 交换 id，中文内容应该占用原文的 id
                    /*
                    const id = prev.getAttribute('id');
                    if (id) {
                      prev.removeAttribute('id');
                      element.setAttribute('id', id);
                    }
                     */
                    var href = prev.getAttribute('href');
                    if (href) {
                        element.setAttribute('href', href);
                    }
                    if (element.tagName.match(/(H[1-6]|li)/)) {
                        var prevAnchor = prev.querySelector('a[href]');
                        var thisAnchor = element.querySelector('a[href]');
                        if (prevAnchor && thisAnchor && common_1.containsChinese(decodeURIComponent(thisAnchor.getAttribute('href')))) {
                            thisAnchor.setAttribute('href', prevAnchor.getAttribute('href'));
                        }
                    }
                }
            }
        });
    }
    html.markAndSwap = markAndSwap;
    function shouldMergeTable(element) {
        return element.getAttribute('translation-merge-rows') === 'no';
    }
    function shouldMergeRow(element) {
        if (element.getAttribute('translation-merge-rows') === 'no') {
            return false;
        }
        // 如果内部有 p 元素，则禁止自动合并
        for (var i = 0; i < element.cells.length; ++i) {
            if (element.cells.item(i).querySelector('p')) {
                return false;
            }
        }
        return true;
    }
    // 重塑表格结构
    function restructureTable(element) {
        var items = element.querySelectorAll('table');
        items.forEach(function (table) {
            if (shouldMergeTable(table)) {
                return;
            }
            // 对出现在 thead 的行和出现在 tbody 的行进行统一处理
            var rows = table.querySelectorAll('* > tr');
            var translationRows = [];
            for (var i = 0; i < rows.length - 1; ++i) {
                var thisRow = rows.item(i);
                var nextRow = rows.item(i + 1);
                if (shouldMergeRow(nextRow) && common_1.containsChinese(nextRow.innerHTML) && !common_1.containsChinese(thisRow.innerHTML)) {
                    translationRows.push(nextRow);
                    mergeRows(thisRow, nextRow);
                }
            }
            translationRows.forEach(function (row) { return row.remove(); });
        });
    }
    html.restructureTable = restructureTable;
    function mergeRows(originRow, translationRow) {
        if (originRow.cells.length !== translationRow.cells.length) {
            console.warn('Origin row must have same cells count with translation row!');
            return;
        }
        for (var i = 0; i < originRow.cells.length; ++i) {
            var originCell = originRow.cells.item(i);
            var translationCell = translationRow.cells.item(i);
            if (originCell.innerHTML !== translationCell.innerHTML) {
                originCell.innerHTML = "<p>" + originCell.innerHTML + "</p><p>" + translationCell.innerHTML + "</p>";
            }
        }
    }
})(html = exports.html || (exports.html = {}));
//# sourceMappingURL=html.js.map