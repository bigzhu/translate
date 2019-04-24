"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remarkParse = require("remark-parse");
var remarkStringify = require("remark-stringify");
var rehypeParse = require("rehype-parse");
var remarkHtml = require("remark-html");
var rehypeRemark = require("rehype-remark");
var frontmatter = require("remark-frontmatter");
var unified = require("unified");
var unistMap = require("unist-util-flatmap");
var unistVisit = require("unist-util-visit");
var unistRemove = require("unist-util-remove");
var rxjs_1 = require("rxjs");
var lodash_1 = require("lodash");
var operators_1 = require("rxjs/operators");
var common_1 = require("./common");
var stringWidth = require("string-width");
var js_yaml_1 = require("js-yaml");
var markdown;
(function (markdown_1) {
    var stringifyOptions = {
        emphasis: '*', listItemIndent: 1, incrementListMarker: false, stringLength: stringWidth,
    };
    function parse(markdown) {
        return unified().use(remarkParse)
            .use(frontmatter)
            .parse(markdown);
    }
    markdown_1.parse = parse;
    function stringify(tree) {
        return unified().use(remarkStringify, stringifyOptions)
            .use(frontmatter)
            .stringify(tree);
    }
    markdown_1.stringify = stringify;
    function mdToHtml(ast) {
        return unified().use(remarkParse)
            .use(frontmatter)
            .use(remarkHtml)
            .processSync(stringify(ast)).contents.toString('utf-8');
    }
    markdown_1.mdToHtml = mdToHtml;
    function htmlToMd(html) {
        return parse(unified().use(rehypeParse).use(rehypeRemark).use(remarkStringify, stringifyOptions).processSync(html));
    }
    markdown_1.htmlToMd = htmlToMd;
    function shouldTranslate(root) {
        var result = true;
        unistVisit(root, function (node) {
            if (common_1.containsChinese(node.value)) {
                result = false;
            }
        });
        return result;
    }
    function translateNormalNode(node, engine) {
        return engine.translate(mdToHtml(preprocess(node))).pipe(operators_1.map(function (html) { return htmlToMd(html); }));
    }
    function translate(tree, engine) {
        var result = unistMap(tree, function (node, _, parent) {
            if ((node.type === 'paragraph' || node.type === 'tableRow' || node.type === 'heading') && shouldTranslate(node)) {
                return [node, markNode(lodash_1.cloneDeep(node), parent)];
            }
            return [node];
        });
        var pairs = [];
        var yamls = [];
        unistVisit(result, function (node) {
            if (node.translation) {
                pairs.push(node);
            }
            if (node.type === 'yaml') {
                yamls.push(node);
            }
        });
        var tasks = pairs.map(function (node) { return rxjs_1.of(node).pipe(operators_1.switchMap(function (node) { return translateNormalNode(node, engine); }), operators_1.tap(function (translation) {
            if (stringify(node) === stringify(translation)) {
                return unistRemove(tree, translation);
            }
        }), operators_1.tap(function (translation) { return postprocess(node, translation); })); });
        var yamlTasks = yamls.map(function (node) { return translateYamlNode(node, engine); });
        return rxjs_1.concat.apply(void 0, tasks.concat(yamlTasks)).pipe(operators_1.toArray(), operators_1.mapTo(result));
    }
    markdown_1.translate = translate;
    function translateYamlNode(node, engine) {
        var frontMatter = js_yaml_1.safeLoad(node.value);
        var result = {};
        var tasks = Object.entries(frontMatter).map(function (_a) {
            var key = _a[0], value = _a[1];
            return engine.translate(value).pipe(operators_1.tap(function (translation) {
                result[key + "$$origin"] = value;
                result[key] = translation;
            }));
        });
        return rxjs_1.concat.apply(void 0, tasks).pipe(operators_1.toArray(), operators_1.tap(function () { return node.value = js_yaml_1.safeDump(result); }), operators_1.mapTo(void 0));
    }
    function preprocess(node) {
        if (node.tableCell) {
            node.type = 'paragraph';
        }
        return node;
    }
    function postprocess(node, translation) {
        if (node.tableCell) {
            translation.type = 'tableCell';
        }
        Object.assign(node, translation);
        return node;
    }
    function markNode(root, container) {
        if (root.type === 'tableRow') {
            unistVisit(root, function (node) {
                if (node.type === 'tableCell') {
                    node.translation = true;
                    node.tableCell = true;
                }
            });
        }
        else {
            root.translation = true;
            if (container.type === 'listItem') {
                container.spread = true;
            }
        }
        return root;
    }
})(markdown = exports.markdown || (exports.markdown = {}));
//# sourceMappingURL=markdown.js.map