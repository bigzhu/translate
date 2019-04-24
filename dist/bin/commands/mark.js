"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var translation_kit_1 = require("../../translation-kit");
var toVFile = require("to-vfile");
var operators_1 = require("rxjs/operators");
exports.command = "mark <sourceGlob>";
exports.describe = '为双语 HTML 文件做后期处理，根据语种加上翻译标记';
exports.builder = {
    sourceGlob: {
        description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
    },
};
exports.handler = function (_a) {
    var sourceGlob = _a.sourceGlob;
    return translation_kit_1.addTranslationMarks(sourceGlob).pipe(operators_1.tap(function (file) { return toVFile.writeSync(file); })).subscribe(function (file) {
        console.log("marked: " + file.path + "!");
    }, function (error) {
        console.error(error);
        process.exit(-1);
    }, function () {
        console.log('Done!');
        process.exit(0);
    });
};
//# sourceMappingURL=mark.js.map