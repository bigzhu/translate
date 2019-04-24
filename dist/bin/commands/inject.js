"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var translation_kit_1 = require("../../translation-kit");
var toVFile = require("to-vfile");
var operators_1 = require("rxjs/operators");
var fs_1 = require("fs");
exports.command = "inject <sourceGlob>";
exports.describe = '为双语 HTML 文件做后期处理，注入翻译工具';
exports.builder = {
    sourceGlob: {
        description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
    },
    styleUrls: {
        array: true,
        alias: 'c',
        description: '要注入的 css 文件，可传多个',
    },
    scriptUrls: {
        array: true,
        alias: 's',
        description: '要注入的 javascript 文件，可传多个',
    },
    urlMap: {
        string: true,
        alias: 'm',
        coerce: function (filename) {
            return JSON.parse(fs_1.readFileSync(filename, 'utf-8'));
        },
        description: '供替换的 url 映射（脚本、css、图片），指向一个 JSON 格式的配置文件，其内容形如：{"old": "new"}',
    },
    textMap: {
        string: true,
        alias: 't',
        coerce: function (filename) {
            return JSON.parse(fs_1.readFileSync(filename, 'utf-8'));
        },
        description: '供替换的文本映射，指向一个 JSON 格式的配置文件，其内容形如：{"oldRegExp": "new"}',
    },
};
exports.handler = function (_a) {
    var sourceGlob = _a.sourceGlob, styleUrls = _a.styleUrls, scriptUrls = _a.scriptUrls, urlMap = _a.urlMap, textMap = _a.textMap;
    return translation_kit_1.injectTranslationKit(sourceGlob, styleUrls, scriptUrls, urlMap, textMap).pipe(operators_1.tap(function (file) { return toVFile.writeSync(file); })).subscribe(function (file) {
        console.log("injected: " + file.path + "!");
    }, function (error) {
        console.error(error);
        process.exit(-1);
    }, function () {
        console.log('Done!');
        process.exit(0);
    });
};
//# sourceMappingURL=inject.js.map