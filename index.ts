// @ts-ignore
import Lexer from "pseudocode/src/Lexer.js"
// @ts-ignore
import Parser from "pseudocode/src/Parser.js"
// @ts-ignore
import Renderer from "pseudocode/src/Renderer.js"
// @ts-ignore
import { QuartzTransformerPlugin } from "quartz/plugins/types"
import { Root as MdRoot } from "mdast"
import { visit } from "unist-util-visit"
import { Literal } from "hast"

// TODO: Adapt the options to the plugin
interface PseudoOptions {
	/**
	 * The indent size of inside a control block, e.g. if, for, etc. The unit must be in 'em'. Default value: '1.2em'.
	 */
	identSize?: string;
	/**
	 * The delimiters used to start and end a comment region. Note that only line comments are supported. Default value: '//'.
	 */
	commentDelimiter?: string;
	/**
	 * The punctuation that follows line number. Default value: ':'.
	 */
	lineNumberPunc?: string;
	/**
	 * Whether line numbering is enabled. Default value: false.
	 */
	lineNumber?: boolean;
	/**
	 * Whether block ending, like `end if`, end `procedure`, etc., are showned. Default value: false.
	 */
	noEnd?: boolean;
	/**
	 * Set the caption counter to this new value.
	 */
	captionCount?: number;
	/**
	 * The prefix in the title of the algorithm. Default value: 'Algorithm'.
	 */
	titlePrefix?: string;

	mathEngine?: "katex" | "mathjax";

	mathRenderer?: (input: string) => string;
}

const latex_blocks: string[] = []

function renderToString(input: string, options?: PseudoOptions): string {
    // Use String.isNullOrEmpty instead of !input
    if (!input)
        throw new Error("Input cannot be empty")
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const renderer = new Renderer(parser, options)
    if (options?.mathEngine || options?.mathRenderer) {
        renderer.backend ??= {}
        renderer.backend.name ??= options?.mathEngine
        renderer.backend.driver ??= {}
        renderer.backend.driver.renderToString ??= options?.mathRenderer
    }
    return renderer.toMarkup()
}

export const Pseudocode: QuartzTransformerPlugin<PseudoOptions> = (opts?: PseudoOptions) => {
    return {
        name: "Pseudocode",
        markdownPlugins() {
            return [
                () => (tree: MdRoot, _file) => {
                    visit(tree, "code", (node) => {
                        if (node.lang === "pseudo") { // TODO: Add support for other language slugs
                            // TODO: Add support for showing line numbers or not and document the option with screenshots of both possible values
                            // TODO: Add support for other class names
                            
                            // Store the code block for later processing
                            latex_blocks.push(node.value)

                            // Transform the code block into an HTML block we can later recognize and replace
                            node.type = "html" as "code"
                            node.value = `<pre class="pseudocode-placeholder"></pre>`
                        }
                    })
                }
            ]
        },
        htmlPlugins() {
            return [
                () => (tree, _file) => {
                    visit(tree, "raw", (raw: Literal) => {
                        if (raw.value !== `<pre class="pseudocode-placeholder"></pre>`) {
                            return
                        }

                        const value = latex_blocks.shift()
                        const markup = renderToString(value!, opts)
                        // TODO: Add a way to remove the algorithm number in the title
                        raw.value = markup
                    })
                }
            ]
        },
        externalResources() {
            return {
              css: ["https://cdn.jsdelivr.net/npm/pseudocode@2.4.1/build/pseudocode.min.css"]
            }
        }
    }
}