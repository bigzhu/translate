"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TranslationEngineType;
(function (TranslationEngineType) {
    TranslationEngineType["google"] = "google";
    TranslationEngineType["ms"] = "ms";
    TranslationEngineType["fake"] = "fake";
})(TranslationEngineType = exports.TranslationEngineType || (exports.TranslationEngineType = {}));
function containsChinese(text) {
    if (!text) {
        return false;
    }
    return text.search(/[\u4e00-\u9fa5]/gm) !== -1;
}
exports.containsChinese = containsChinese;
//# sourceMappingURL=common.js.map