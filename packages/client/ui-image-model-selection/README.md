---
description: "Choose the image generation tool's configured model from the Web conversation menu."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-image-model-selection

English | [中文](README.zh.md)

## Summary

This Client plugin adds an image model row and choice pane to the conversation model menu. It reads the installed `openai-image-tool` settings and saves the selected model through the settings Remote API.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Open the composer model menu, choose **Image model**, then select one of the models configured under `openai-image-tool.models`. The row appears only while that tool exposes a nonempty model list through settings. The menu shows each ID without its provider prefix; the complete ID goes to the image API. Selecting closes the menu and changes the tool's `defaultModel` setting; the chat model selection is separate.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

The control uses `conversation.input.model.options` and reads the current settings descriptor when mounted. It shows no row until a usable tool configuration has loaded. The menu owner manages the choice pane, Escape navigation, and focus restoration. A selection writes `defaultModel` with the descriptor's revision; failed or conflicting writes report an error and leave the choice pane open. The Host image tool reads its live model value when executing `image_generate`.

-----

<a id="further-exploration"></a>
## Further Exploration

See [model selection](../ui-model-selection/README.md) for the menu slot behavior and [settings](../../settings/settings/README.md) for volatile configuration writes.

-----

<a id="model-experience"></a>
## Model Experience

None, as this browser control adds no model-facing conversation text.

#### KV Cache effect

The setting changes later `image_generate` routes without changing the chat request prefix.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- This selector controls `openai-image-tool` only; a listed model may still be rejected by the configured image endpoint.

<a id="dev-note"></a>
### Dev Note

The menu removes the prefix before the last slash only for display; settings and image requests retain the complete model ID.
