"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
function parse() {
    return function (file) { return new jsdom_1.JSDOM(file.contents); };
}
exports.parse = parse;
function stringify() {
    return function (dom) { return dom.serialize(); };
}
exports.stringify = stringify;
//# sourceMappingURL=rx-jsdom.js.map