"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var internal_compatibility_1 = require("rxjs/internal-compatibility");
var request = require("request-promise-native");
var uuid_1 = require("uuid");
var operators_1 = require("rxjs/operators");
var automl_1 = require("@google-cloud/automl");
var common_1 = require("./common");
var TranslationEngine = /** @class */ (function () {
    function TranslationEngine() {
    }
    return TranslationEngine;
}());
exports.TranslationEngine = TranslationEngine;
function getTranslateEngine(engine) {
    switch (engine) {
        case common_1.TranslationEngineType.google:
            return new GoogleTranslator();
        case common_1.TranslationEngineType.ms:
            return new MsTranslator();
        case common_1.TranslationEngineType.fake:
            return new FakeTranslator();
        default:
            throw new Error('Unknown Translation Engine type');
    }
}
exports.getTranslateEngine = getTranslateEngine;
var MsTranslator = /** @class */ (function (_super) {
    __extends(MsTranslator, _super);
    function MsTranslator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MsTranslator.prototype.translate = function (text) {
        return translateByMsTranslator(text);
    };
    return MsTranslator;
}(TranslationEngine));
var GoogleTranslator = /** @class */ (function (_super) {
    __extends(GoogleTranslator, _super);
    function GoogleTranslator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GoogleTranslator.prototype.translate = function (text) {
        return translateByGoogleAutoML(text);
    };
    return GoogleTranslator;
}(TranslationEngine));
var FakeTranslator = /** @class */ (function (_super) {
    __extends(FakeTranslator, _super);
    function FakeTranslator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FakeTranslator.prototype.translate = function (text) {
        if (text.startsWith('<')) {
            return rxjs_1.of(text.replace(/<(\w+)(.*?)>(.*?)<\/\1>/g, '<$1$2>译$3</$1>'));
        }
        else {
            return rxjs_1.of('[译]' + text);
        }
    };
    return FakeTranslator;
}(TranslationEngine));
function translateByMsTranslator(text) {
    var subscriptionKey = process.env.MS_TRANSLATOR;
    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.');
    }
    return internal_compatibility_1.fromPromise(request({
        method: 'POST',
        baseUrl: 'https://api.cognitive.microsofttranslator.com/',
        url: 'translate',
        qs: {
            'api-version': '3.0',
            'to': 'zh-Hans',
            category: '1a5430e5-383d-45be-a1ba-b3d99d0176f8-TECH',
            textType: 'html',
        },
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuid_1.v4().toString(),
        },
        body: [{
                'text': text,
            }],
        json: true,
    })).pipe(operators_1.map(function (results) { return results[0]; }), operators_1.map(function (result) { return result.translations[0].text; }));
}
function translateByGoogleAutoML(text) {
    var client = new automl_1.PredictionServiceClient();
    var formattedName = client.modelPath('ralph-gde', 'us-central1', 'TRL9199068616738092360');
    var payload = {
        textSnippet: {
            content: text,
            mimeType: "text/html",
        },
    };
    var request = {
        name: formattedName,
        payload: payload,
    };
    return internal_compatibility_1.fromPromise(client.predict(request).then(function (responses) {
        return responses[0].payload[0].translation.translatedContent.content;
    }));
}
//# sourceMappingURL=engine.js.map