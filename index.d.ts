// @ts-ignore
import { QuartzTransformerPlugin } from "quartz/plugins/types";
export interface PseudoOptions {
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
export declare const Pseudocode: QuartzTransformerPlugin<PseudoOptions>;
