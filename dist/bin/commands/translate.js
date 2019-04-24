"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var translation_kit_1 = require("../../translation-kit");
var common_1 = require("../../common");
var toVFile = require("to-vfile");
var operators_1 = require("rxjs/operators");
exports.command = "translate <sourceGlob>";
exports.describe = '自动翻译 sourceGlob 中的文件，支持 html 和 markdown 两种格式';
exports.builder = {
    sourceGlob: {
        description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
    },
    engine: {
        type: 'string',
        choices: [common_1.TranslationEngineType.google, common_1.TranslationEngineType.ms, common_1.TranslationEngineType.fake],
        default: common_1.TranslationEngineType.google,
    },
};
exports.handler = function (_a) {
    var sourceGlob = _a.sourceGlob, engine = _a.engine;
    var kit = new translation_kit_1.TranslationKit(engine);
    return kit.translateFiles(sourceGlob).pipe(operators_1.tap(function (file) { return toVFile.writeSync(file); })).subscribe();
};
//# sourceMappingURL=translate.js.map