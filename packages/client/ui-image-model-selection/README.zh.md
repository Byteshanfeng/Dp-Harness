---
description: "在 Web 对话菜单中选择生图工具已配置的模型。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-image-model-selection

[English](README.md) | 中文

## 概述

此 Client 插件在对话模型菜单中增加生图模型菜单行和选项页。它读取已安装的 `openai-image-tool` 设置，并通过 settings Remote API 保存所选模型。

## 目录

- [使用此包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与后续工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

打开输入区的模型菜单，点击**生图模型**，再从选项页选择 `openai-image-tool.models` 配置的模型。只有该工具通过 settings 提供非空模型列表时才显示这一入口。菜单显示去掉提供方前缀的 ID；完整 ID 发送给生图 API。选择后菜单关闭，工具的 `defaultModel` 设置更新；对话模型的选择独立保留。

-----

<a id="understand-the-implementation"></a>
## 理解实现

控件使用 `conversation.input.model.options`，挂载时读取当前 settings 描述。读取到可用的工具配置后才显示菜单行。菜单所有者负责选项页、Escape 返回和焦点恢复。选择操作携带描述中的 revision 写入 `defaultModel`；写入失败或冲突时，菜单报告错误并保留选项页。Host 生图工具执行 `image_generate` 时读取实时模型值。

-----

<a id="further-exploration"></a>
## 进一步探索

菜单 slot 行为参见[模型选择](../ui-model-selection/README.zh.md)，可变配置写入参见[设置](../../settings/settings/README.zh.md)。

-----

<a id="model-experience"></a>
## 模型体验

无；此浏览器控件不会在对话中增加模型可见文本。

#### KV 缓存影响

此设置会改变后续 `image_generate` 调用的路由，不会改变对话请求的前缀。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- 此选择器仅控制 `openai-image-tool`；菜单列出的模型仍可能被已配置的生图接口拒绝。

<a id="dev-note"></a>
### 开发备注

菜单只在展示时去掉最后一个斜杠之前的前缀；设置和生图请求保留完整模型 ID。
