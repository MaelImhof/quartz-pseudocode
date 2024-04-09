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
    if (!input)
        throw new Error("Input cannot be empty");
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const renderer = new Renderer(parser, options);
    if (options?.mathEngine || options?.mathRenderer) {
        renderer.backend ??= {};
        renderer.backend.name ??= options?.mathEngine;
        renderer.backend.driver ??= {};
        renderer.backend.driver.renderToString ??= options?.mathRenderer;
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
    const opts = { ...defaultOptions, ...userOpts };
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
                        if (raw.value !== `<pre class="${opts.placeholderCssClass}"></pre>`) {
                            return;
                        }
                        const value = latex_blocks.shift();
                        const markup = renderToString(value, opts?.renderer);
                        if (opts.removeCaptionCount) {
                            raw.value = removeCaptionCount(markup, opts?.renderer?.titlePrefix ?? "Algorithm");
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
