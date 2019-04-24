#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
yargs
    .usage('$0 <cmd> [args]')
    .commandDir('./commands', { extensions: ['js', 'ts'], exclude: /.d.ts$/ })
    .help().parse();
//# sourceMappingURL=index.js.map