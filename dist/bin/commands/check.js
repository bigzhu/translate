"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var translation_kit_1 = require("../../translation-kit");
var operators_1 = require("rxjs/operators");
var common_1 = require("../../common");
exports.command = "check <sourceGlob>";
exports.describe = '根据中英字符串长度粗略检查翻译结果';
exports.builder = {
    sourceGlob: {
        description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
    },
    engine: {
        type: 'string',
        choices: [common_1.TranslationEngineType.google, common_1.TranslationEngineType.ms],
        default: common_1.TranslationEngineType.google,
    },
};
exports.handler = function (_a) {
    var sourceGlob = _a.sourceGlob, engine = _a.engine;
    var kit = new translation_kit_1.TranslationKit(engine);
    return kit.extractLowQualifyResults(sourceGlob)
        .pipe(operators_1.toArray(), operators_1.map(function (pairs) { return pairs.join('\n'); }))
        .subscribe(function (pairs) {
        console.log(pairs);
    });
};
//# sourceMappingURL=check.js.map