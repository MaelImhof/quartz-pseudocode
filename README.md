# Quartz Pseudocode

[Quartz](https://quartz.jzhao.xyz/) is a fast, batteries-included static-site generator that transforms Markdown content into fully functional websites.

In particular, Quartz supports transforming your [Obsidian](https://obsidian.md/) notes into a static website.

Natively, Quartz does not support pseudocode and algorithm rendering as HTML. This plugin makes it easy to make Quartz work with [pseudocode.js](https://github.com/SaswatPadhi/pseudocode.js) and the Obsidian plugin [obsidian-pseudocode](https://github.com/ytliu74/obsidian-pseudocode).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Recommendation for Editing](#recommendation-for-editing)
  - [Syntax](#syntax)
  - [Example](#example)
  - [Configuration](#configuration)
- [Credits](#credits)
- [Contribute](#contribute)

## Installation

Here is how to install the plugin and make it render pseudocode:

1) Make sure you have a working Quartz 4 installation (see instructions [here](https://quartz.jzhao.xyz/#-get-started))
2) Open a terminal at the root of your Quartz 4 installation (the folder that contains `quartz.config.ts`)
3) Run the command `npm install git+https://github.com/MaelImhof/quartz-pseudocode.git`
4) Wait for the installation to finish. Do not close the terminal until then.
5) Once the installation is finished, we still need to enable the plugin (tell Quartz we want to use it). To do this, open the file `quartz.config.ts` in a text editor.
6) Add this line among the other `import lines` (the order does not matter, you can add this as the last one).
```typescript
import { Pseudocode as CommunityPseudocode } from "quartz-pseudocode"
```
7) Go down in the file until you find something than resembles to this:
```ts
plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
```
8) Add the provided code snippet to make it look like the following (for more advanced user, note that the plugin is a [transformer](https://quartz.jzhao.xyz/advanced/making-plugins#transformers) and the order does not matter here):
```ts
plugins: {
    transformers: [
      CommunityPseudocode(), // Add this line to enable the plugin
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
```

After carefully following those steps, your Quartz installation should be able to render pseudocode.

**If your pseudocode is still displayed as raw LaTex code, you should take a look at the next section ([usage](#usage)).** You might have a slightly different way of writing pseudocode, which requires you to tweak some options for the plugin to detect and render the pseudocode to your liking.

## Usage

Once the plugin is installed and enabled (see [above section](#installation)), you can use MarkDown code blocks with language `pseudo`, to write LaTex that will be rendered to a pseudocode at build-time.

### Recommendation for Editing

Just like the [Quartz documentation](https://quartz.jzhao.xyz/authoring-content), I recommend using [Obsidian](https://obsidian.md/) as an editor for your Quartz content.

Along with Obsidian, I recommend using the Obsidian plugin [obsidian-pseudocode](https://github.com/ytliu74/obsidian-pseudocode). This will have the same effect as `quartz-pseudocode` in Obsidian, meaning it will render your algorithms and pseudocode transparently. `quartz-pseudocode` is meant to work with content edited using `obsidian-pseudocode` out-of-the-box.

### Syntax

For a complete rundown on the supported syntax, please refer to the [`obsidian-pseudocode` Obsidian plugin documentation](https://github.com/ytliu74/obsidian-pseudocode).

### Example

Writing this in your markdown file:

````
```pseudo
\begin{algorithm}
\caption{Simple Algorithm}
\begin{algorithmic}
	\Comment{This is a simple example}
	\Procedure{Simple-Algorithm}{$n$}
		\If{$n = 0$}
			\Return $n$
        \EndIf
        \For{$i = 0$ \To $n$}
	        \State $n \gets n-1$
        \EndFor
        \Return n
    \EndProcedure
\end{algorithmic}
\end{algorithm}
```
````

Will be rendered like this when you build your Quartz website:

![`The rendered result of the above algorithm should appear here`](images/simple-algorithm.png)

### Configuration

If the plugin does not render correctly yet, you can make it work or customize how it renders pseudocode by tweaking some configuration settings.

To customize parameters, you must pass them as an object to the plugin in `quartz.config.ts`. If some or all settings are missing, the default values will apply for those specific settings.

Here is the default configuration. You can tweak individual settings and remove the ones you don't want to change.

```ts
CommunityPseudocode({
    codeLang: "pseudo",
    placeholderCssClass: "pseudocode-placeholder",
    removeCaptionCount: false,
    renderer: {
        identSize: "1.2em",
        commentDelimiter: "//",
        lineNumberPunc: ":",
        lineNumber: false,
        noEnd: false,
        captionCount: undefined,
        titlePrefix: "Algorithm",
        mathEngine: undefined,
        mathRenderer: undefined
    }
})
```

Below is a list of the options with some documentation for each one.

#### `codeLang` (`string`)

The language slug that is used in markdown code blocks where pseudocode is written. This corresponds to the name you write after the three backticks.

It defaults to `pseudo`, which is used by the Obsidian plugin.

See the [example](#example) if you are not sure what this setting corresponds to.

#### `placeholderCssClass` (`string`)

This setting does not need to be modified unless there is a conflict with another feature of Quartz.

Under the hood, this plugin replaces your markdown code block with a placeholder and then replaces the placeholder with the processed HTML markup. This setting defines what CSS class is used to identify the placeholder in the raw HTML.

Defaults to `pseudocode-placeholder`.

#### `removeCaptionCount` (`boolean`)

By default, a number is printed aside of your algorithm title. For example `1`:

![`An image of the number printed in the title should appear here`](images/caption-count.png)

If set to `true`, this setting ensures that the number is not printed. In the above example, only "**Algorithm** Simple Algorithm" would be printed.

Defaults to `false`.

#### `renderer.identSize` (`string`)

The indent size of inside a control block, e.g. if, for, etc. The unit must be in `em`.

Defaults to `1.2em`.

#### `renderer.commentDelimiter` (`string`)

he delimiters used to start and end a comment region. Note that only line comments are supported.

Defaults to `//`.

#### `renderer.lineNumberPunc` (`string`)

The punctuation that follows line number.

Defaults to `:`.

#### `renderer.lineNmber` (`boolean`)

Whether line numbers will be displayed on the left of the pseudocode.

Defaults to `false`.

#### `renderer.noEnd` (`boolean`)

If set to `true`, block endings (`end if`, `end for`, `end procedures`, ...) will not be displayed.

Defaults to `false`.

#### `renderer.captionCount`

Related to the number displayed in the title of the pseudocode.

![`An image of the number printed in the title should appear here`](images/caption-count.png)

If its value is set, the counter will be reset at each rendering, so all rendered pseudocode blocks will have the same number. If the value is `0`, for example, all algorithms will have `1` displayed.

Defaults to `undefined`.

#### `renderer.titlePrefix`

The prefix displayed in front of the title of an algorithm, before the counter if there is one. Defaults to `Algorithm`.

![`An image of the number printed in the title should appear here`](images/caption-count.png)

#### `renderer.mathEngine`

Which math engine to use. Either `katex` or `mathjax`.

#### `renderer.mathRenderer`

You can use this setting to provide a function that will be used to parse the LaTex string by the [pseudocode.js](https://github.com/SaswatPadhi/pseudocode.js) library this plugin uses. For more information, refer to their own documentation.

## Credits

Credits have been moved to a [separate file](CREDITS.md) so they don't appear on the NPM registry forever without their consent.

## Contribute

> [!NOTE]
> This section is not ready yet but contributions are welcome. Feel free to open an issue, a discussion or a pull request.