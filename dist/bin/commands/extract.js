"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var translation_kit_1 = require("../../translation-kit");
var operators_1 = require("rxjs/operators");
var fs_1 = require("fs");
var common_1 = require("../../common");
exports.command = "extract <sourceGlob> [outFile]";
exports.describe = '提取翻译对';
exports.builder = {
    sourceGlob: {
        description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
    },
    outFile: {
        description: '结果输出到的文件，不要带扩展名',
        default: 'STDOUT',
    },
    outType: {
        type: 'string',
        choices: [common_1.TranslationEngineType.google, common_1.TranslationEngineType.ms, common_1.TranslationEngineType.fake],
        default: common_1.TranslationEngineType.google,
    },
    pattern: {
        type: 'string',
        default: '.*',
        description: '要过滤的正则表达式',
    },
    unique: {
        type: 'boolean',
        default: false,
    },
};
exports.handler = function (_a) {
    var sourceGlob = _a.sourceGlob, outFile = _a.outFile, unique = _a.unique, outType = _a.outType, pattern = _a.pattern;
    var engine = new translation_kit_1.TranslationKit(outType);
    var regExp = new RegExp(pattern, 'i');
    return engine.extractTrainingDataset(sourceGlob, unique)
        .pipe(operators_1.filter(function (it) { return regExp.test(it.english) || regExp.test(it.chinese); }), operators_1.toArray())
        .subscribe(function (pairs) {
        if (outType === common_1.TranslationEngineType.google) {
            var content = pairs.map(function (it) { return it.english + "\t" + it.chinese; }).join('\n');
            writeTo(outFile, 'pair', content);
        }
        else if (outType === common_1.TranslationEngineType.ms) {
            writeTo(outFile, 'en', pairs.map(function (it) { return it.english; }).join('\n'));
            writeTo(outFile, 'cn', pairs.map(function (it) { return it.chinese; }).join('\n'));
        }
    });
};
function writeTo(filename, lang, content) {
    if (filename === 'STDOUT') {
        process.stdout.write(content);
    }
    else {
        fs_1.writeFileSync(filename + "_" + lang + ".txt", content);
    }
}
//# sourceMappingURL=extract.js.map