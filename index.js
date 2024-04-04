"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pseudocode = void 0;
// @ts-ignore
var Lexer_js_1 = require("pseudocode/src/Lexer.js");
// @ts-ignore
var Parser_js_1 = require("pseudocode/src/Parser.js");
// @ts-ignore
var Renderer_js_1 = require("pseudocode/src/Renderer.js");
var unist_util_visit_1 = require("unist-util-visit");
var unified_1 = require("unified");
var rehype_parse_1 = require("rehype-parse");
var latex_blocks = [];
function renderToString(input, options) {
    var _a, _b, _c, _d;
    var _e, _f, _g;
    // Use String.isNullOrEmpty instead of !input
    if (!input)
        throw new Error("Input cannot be empty");
    var lexer = new Lexer_js_1.default(input);
    var parser = new Parser_js_1.default(lexer);
    var renderer = new Renderer_js_1.default(parser, options);
    if ((options === null || options === void 0 ? void 0 : options.mathEngine) || (options === null || options === void 0 ? void 0 : options.mathRenderer)) {
        (_a = renderer.backend) !== null && _a !== void 0 ? _a : (renderer.backend = {});
        (_b = (_e = renderer.backend).name) !== null && _b !== void 0 ? _b : (_e.name = options === null || options === void 0 ? void 0 : options.mathEngine);
        (_c = (_f = renderer.backend).driver) !== null && _c !== void 0 ? _c : (_f.driver = {});
        (_d = (_g = renderer.backend.driver).renderToString) !== null && _d !== void 0 ? _d : (_g.renderToString = options === null || options === void 0 ? void 0 : options.mathRenderer);
    }
    return renderer.toMarkup();
}
var Pseudocode = function (opts) {
    var parser = (0, unified_1.unified)().use(rehype_parse_1.default, { fragment: true });
    return {
        name: "Pseudocode",
        markdownPlugins: function () {
            return [
                function () { return function (tree, _file) {
                    (0, unist_util_visit_1.visit)(tree, "code", function (node) {
                        if (node.lang === "pseudo") { // TODO: Add support for other language slugs
                            // TODO: Add support for showing line numbers or not and document the option with screenshots of both possible values
                            // TODO: Add support for other class names
                            // Store the code block for later processing
                            latex_blocks.push(node.value);
                            // Transform the code block into an HTML block we can later recognize and replace
                            node.type = "html";
                            node.value = "<pre class=\"pseudocode-placeholder\"></pre>";
                        }
                    });
                }; }
            ];
        },
        htmlPlugins: function () {
            return [
                function () { return function (tree, _file) {
                    (0, unist_util_visit_1.visit)(tree, "raw", function (raw) {
                        if (raw.value !== "<pre class=\"pseudocode-placeholder\"></pre>") {
                            return;
                        }
                        var value = latex_blocks.shift();
                        var markup = renderToString(value, { captionCount: undefined, lineNumber: true, lineNumberPunc: "", noEnd: true });
                        // TODO: Add a way to remove the algorithm number in the title
                        raw.value = markup;
                    });
                }; }
            ];
        },
        externalResources: function () {
            return {
                css: ["https://cdn.jsdelivr.net/npm/pseudocode@2.4.1/build/pseudocode.min.css"]
            };
        }
    };
};
exports.Pseudocode = Pseudocode;
