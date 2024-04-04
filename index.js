import { visit } from "unist-util-visit";
/*
 * The three following lines are marked to be ignored by TypeScript because the pseudocode.js library does not
 * provide a type definition file.
 */
// @ts-ignore
import Lexer from "pseudocode/src/Lexer.js";
// @ts-ignore
import Parser from "pseudocode/src/Parser.js";
// @ts-ignore
import Renderer from "pseudocode/src/Renderer.js";
const defaultOptions = {
    codeLang: "pseudo",
    placeholderCssClass: "pseudocode-placeholder",
    removeCaptionCount: false,
    renderer: undefined
};
/**
 * Renders a LaTex string to HTML using pseudocode.js
 *
 * Stolen code from https://www.npmjs.com/package/rehype-pseudo/v/1.0.2
 *
 * @param input The LaTex string to be parsed and rendered
 * @param options The options to be passed to the renderer (see PseudoRendererOptions)
 * @returns The rendered HTML string
 */
function renderToString(input, options) {
    var _a, _b, _c, _d;
    var _e, _f, _g;
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
/**
 * Experimental feature to remove the caption count from the title of the rendered pseudocode using a RegEx.
 *
 * @param renderedMarkup The HTML markup that was generated from LaTex by pseudocode.js
 * @param captionValue The value used for the title of the rendered pseudocode (by default 'Algorithm')
 * @returns The HTML markup without the caption count
 */
function removeCaptionCount(renderedMarkup, captionValue) {
    // Escape potential special regex characters in the custom caption
    const escapedCaption = captionValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<span class="ps-keyword">${escapedCaption} [-]?\\d+[ ]?<\\/span>`, "g");
    return renderedMarkup.replace(regex, `<span class="ps-keyword">${captionValue} </span>`);
}
export const Pseudocode = (userOpts) => {
    // Merge the default options with the user options
    const opts = Object.assign(Object.assign({}, defaultOptions), userOpts);
    /**
     * Used to store the LaTex raw string content in order as they are found in the markdown file.
     * They will be processed in the same order later on to be converted to HTML.
     */
    const latex_blocks = [];
    return {
        name: "Pseudocode",
        markdownPlugins() {
            return [
                () => (tree, _file) => {
                    visit(tree, "code", (node) => {
                        if (node.lang === opts.codeLang) {
                            // Store the code block for later processing
                            latex_blocks.push(node.value);
                            // Transform the code block into an HTML block we can later recognize and replace
                            node.type = "html";
                            node.value = `<pre class="${opts.placeholderCssClass}"></pre>`;
                        }
                    });
                }
            ];
        },
        htmlPlugins() {
            return [
                () => (tree, _file) => {
                    visit(tree, "raw", (raw) => {
                        var _a, _b;
                        if (raw.value !== `<pre class="${opts.placeholderCssClass}"></pre>`) {
                            return;
                        }
                        const value = latex_blocks.shift();
                        const markup = renderToString(value, opts === null || opts === void 0 ? void 0 : opts.renderer);
                        if (opts.removeCaptionCount) {
                            raw.value = removeCaptionCount(markup, (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.renderer) === null || _a === void 0 ? void 0 : _a.titlePrefix) !== null && _b !== void 0 ? _b : "Algorithm");
                        }
                        else {
                            raw.value = markup;
                        }
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
