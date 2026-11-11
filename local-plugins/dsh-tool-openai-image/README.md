# Image generation tool

English | [中文](README.zh.md)

This local Web profile plugin registers `image_generate` and saves generated images as Harness attachments. It routes the existing models through an OpenAI-compatible API. Selecting `dashscope/wan2.7-image-pro` uses the DashScope synchronous Wan 2.7 API and sends `wan2.7-image-pro` as the wire model ID.

The Web profile lists `dashscope/wan2.7-image-pro` under **Image model**. Its `wanBaseURL` defaults to the Beijing DashScope endpoint, `wanApiKeyEnv` names a credential reference, and `wanDefaultSize` defaults to `2K`. For a Singapore key, set `wanBaseURL` to `https://dashscope-intl.aliyuncs.com/api/v1` in the Web profile patch. Region, endpoint, and key must match. The tool supports text to image; its `quality`, `background`, and `output_format` arguments are rejected for Wan.

Set `DASHSCOPE_API_KEY` in the Harness credential store or the launching environment after replacing any exposed key. The key must stay out of `cordis.patch.yml`. Restart the Web profile after changing this local plugin's code; selecting the image model then changes the route for subsequent `image_generate` calls.

Wan returns temporary image URLs. The plugin downloads each result and stores it as an attachment before reporting success. If the request, download, or attachment save fails, the tool reports an error and does not publish a generated image in the conversation.

Image downloads reject local or private addresses, including DNS results and redirect targets. Both downloaded images and Base64 results are checked against `maxImageBytes` while reading or before decoding; API response bodies also have a limit derived from the requested image count and `maxImageBytes`.
