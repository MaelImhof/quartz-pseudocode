import { Root as HTMLRoot } from "hast"
import { Root as MdRoot } from "mdast"
import { visit } from "unist-util-visit"
import { Literal } from "hast"
import { VFile } from "vfile"

/*
 * The three following lines are marked to be ignored by TypeScript because the pseudocode.js library does not
 * provide a type definition file.
 */
// @ts-ignore
import Lexer from "pseudocode/src/Lexer.js"
// @ts-ignore
import Parser from "pseudocode/src/Parser.js"
// @ts-ignore
import Renderer from "pseudocode/src/Renderer.js"

/*
 * The following line is marked to be ignored by TypeScript because Quartz does not provide a separated type
 * definition file yet.
 */
// @ts-ignore
import { QuartzTransformerPlugin } from "quartz/plugins/types"

/**
 * Options type for the quartz-pseudocode plugin. Can be passed to the plugin in quartz.config.ts to
 * customize the rendering of pseudocode.
 */
interface PseudocodeOptions {
    /**
     * The language used in the markdown code block. Used to determine which code blocks should be parsed and rendered.
     * Default value: 'pseudo'.
     */
    codeLang: string,
    /**
     * Options for the renderer itself. These are a subset of the options that can be passed to the Quartz plugin.
     * See the PseudoRendererOptions type for more details.
     */
    renderer: PseudoRendererOptions|undefined
}

const defaultOptions: PseudocodeOptions = {
    codeLang: "pseudo",
    renderer: undefined
}

/**
 * Options of the renderer itself. These are a subset of the options that can be passed to the Quartz plugin.
 * See the PseudocodeOptions type for the full list of options.
 * 
 * Stolen code from https://www.npmjs.com/package/rehype-pseudo/v/1.0.2, originally called PseudoOptions
 */
interface PseudoRendererOptions {
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

/**
 * Renders a LaTex string to HTML using pseudocode.js
 * 
 * Stolen code from https://www.npmjs.com/package/rehype-pseudo/v/1.0.2
 * 
 * @param input The LaTex string to be parsed and rendered
 * @param options The options to be passed to the renderer (see PseudoRendererOptions)
 * @returns The rendered HTML string
 */
function renderToString(input: string, options?: PseudoRendererOptions): string {
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

export const Pseudocode: QuartzTransformerPlugin<PseudocodeOptions> = (userOpts?: PseudocodeOptions) => {

    // Merge the default options with the user options
    const opts = {...defaultOptions, ...userOpts}

    /**
     * Used to store the LaTex raw string content in order as they are found in the markdown file.
     * They will be processed in the same order later on to be converted to HTML.
     */
    const latex_blocks: string[] = []

    return {
        name: "Pseudocode",
        markdownPlugins() {
            return [
                () => (tree: MdRoot, _file: VFile) => {
                    visit(tree, "code", (node) => {
                        if (node.lang === opts.codeLang) {
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
                () => (tree: HTMLRoot, _file: VFile) => {
                    visit(tree, "raw", (raw: Literal) => {
                        if (raw.value !== `<pre class="pseudocode-placeholder"></pre>`) {
                            return
                        }

                        const value = latex_blocks.shift()
                        const markup = renderToString(value!, opts?.renderer)
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