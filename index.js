// @ts-ignore
import Lexer from "pseudocode/src/Lexer.js";
// @ts-ignore
import Parser from "pseudocode/src/Parser.js";
// @ts-ignore
import Renderer from "pseudocode/src/Renderer.js";
import { visit } from "unist-util-visit";
const latex_blocks = [];
function renderToString(input, options) {
    var _a, _b, _c, _d;
    var _e, _f, _g;
    // Use String.isNullOrEmpty instead of !input
    if (!input)
        throw new Error("Input cannot be empty");
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const renderer = new Renderer(parser, options);
    if ((options === null || options === void 0 ? void 0 : options.mathEngine) || (options === null || options === void 0 ? void 0 : options.mathRenderer)) {
        (_a = renderer.backend) !== null && _a !== void 0 ? _a : (renderer.backend = {});
        (_b = (_e = renderer.backend).name) !== null && _b !== void 0 ? _b : (_e.name = options === null || options === void 0 ? void 0 : options.mathEngine);
        (_c = (_f = renderer.backend).driver) !== null && _c !== void 0 ? _c : (_f.driver = {});
        (_d = (_g = renderer.backend.driver).renderToString) !== null && _d !== void 0 ? _d : (_g.renderToString = options === null || options === void 0 ? void 0 : options.mathRenderer);
    }
    return renderer.toMarkup();
}
export const Pseudocode = (opts) => {
    return {
        name: "Pseudocode",
        markdownPlugins() {
            return [
                () => (tree, _file) => {
                    visit(tree, "code", (node) => {
                        if (node.lang === "pseudo") { // TODO: Add support for other language slugs
                            // TODO: Add support for showing line numbers or not and document the option with screenshots of both possible values
                            // TODO: Add support for other class names
                            // Store the code block for later processing
                            latex_blocks.push(node.value);
                            // Transform the code block into an HTML block we can later recognize and replace
                            node.type = "html";
                            node.value = `<pre class="pseudocode-placeholder"></pre>`;
                        }
                    });
                }
            ];
        },
        htmlPlugins() {
            return [
                () => (tree, _file) => {
                    visit(tree, "raw", (raw) => {
                        if (raw.value !== `<pre class="pseudocode-placeholder"></pre>`) {
                            return;
                        }
                        const value = latex_blocks.shift();
                        const markup = renderToString(value, opts);
                        // TODO: Add a way to remove the algorithm number in the title
                        raw.value = markup;
                    });
                }
            ];
        },
        externalResources() {
            return {
                css: ["https://cdn.jsdelivr.net/npm/pseudocode@2.4.1/build/pseudocode.min.css"]
            };
        }
    };
};
