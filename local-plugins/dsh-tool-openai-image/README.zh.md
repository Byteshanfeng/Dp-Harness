# 生图工具

[English](README.md) | 中文

此本地 Web profile 插件注册 `image_generate`，并将生成的图片保存为 Harness 附件。它通过 OpenAI 兼容 API 调用现有模型。选择 `dashscope/wan2.7-image-pro` 时，插件调用 DashScope 万相 2.7 同步 API，并发送 `wan2.7-image-pro` 作为请求中的模型 ID。

Web profile 在**生图模型**中列出 `dashscope/wan2.7-image-pro`。`wanBaseURL` 默认使用北京 DashScope 端点，`wanApiKeyEnv` 指定凭据引用，`wanDefaultSize` 默认为 `2K`。使用新加坡地区的密钥时，在 Web profile patch 中将 `wanBaseURL` 设为 `https://dashscope-intl.aliyuncs.com/api/v1`。地区、端点和密钥必须匹配。工具支持文生图；万相不支持 `quality`、`background` 和 `output_format` 参数。

更换已暴露的密钥后，在 Harness 凭据存储或启动环境中设置 `DASHSCOPE_API_KEY`。密钥不得写入 `cordis.patch.yml`。修改此本地插件的代码后，重启 Web profile；随后选择生图模型会改变后续 `image_generate` 调用的路由。

万相返回临时图片 URL。插件会下载每张图片并保存为附件，然后才报告成功。如果请求、下载或附件保存失败，工具会报告错误，不会在对话中发布生成的图片。

图片下载会拒绝本地或私有地址，包括 DNS 解析结果及重定向目标。下载图片和 Base64 结果在读取过程中或解码前接受 `maxImageBytes` 限制；API 响应体也按请求的图片数量和 `maxImageBytes` 推导上限。
