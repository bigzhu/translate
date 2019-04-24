"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toVFile = require("to-vfile");
var path_1 = require("path");
var globby_1 = require("globby");
function listFiles(globPattern) {
    if (globPattern.indexOf('*') === -1 && path_1.extname(globPattern) === '.') {
        globPattern = path_1.join(globPattern, '**/*.html');
    }
    return globby_1.sync(globPattern);
}
exports.listFiles = listFiles;
function read(charset) {
    if (charset === void 0) { charset = 'utf-8'; }
    return function (path) { return toVFile.readSync(path, charset); };
}
exports.read = read;
function write(file) {
    return function (contents) {
        file.contents = contents;
        toVFile.writeSync(file);
    };
}
exports.write = write;
//# sourceMappingURL=rx-file.js.map