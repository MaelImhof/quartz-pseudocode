import { QuartzTransformerPlugin } from "quartz/plugins/types";
/**
 * Options type for the quartz-pseudocode plugin. Can be passed to the plugin in quartz.config.ts to
 * customize the rendering of pseudocode.
 */
interface PseudocodeOptions {
    /**
     * The language used in the markdown code block. Used to determine which code blocks should be parsed and rendered.
     * Default value: 'pseudo'.
     */
    codeLang: string;
    /**
     * Options for the renderer itself. These are a subset of the options that can be passed to the Quartz plugin.
     * See the PseudoRendererOptions type for more details.
     */
    renderer: PseudoRendererOptions | undefined;
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
export declare const Pseudocode: QuartzTransformerPlugin<PseudocodeOptions>;
export {};
