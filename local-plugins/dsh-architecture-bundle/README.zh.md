---
description: "安装独立的建筑设计模式，并将 IFClite、CAD 和 Blender 工具限定在该模式中。"
kind: "package-bundle"
---

# 建筑设计模式

[English](README.md) | 中文

## 概述

这个 bundle 在 Web profile 中增加「建筑设计」模式，并让「标准模式」继续作为默认模式。IFClite MCP、CAD 和 Blender 工具只注册到建筑模式；CAD 和 Blender 的浏览器组件仍由各自的已安装 bundle 提供。现有会话保留原来的模式，新建会话时选择「建筑设计」。

## 安装

在仓库根目录运行安装脚本，将固定版本的插件源码装入 Web profile：

```sh
node vendor/external/install-web.mjs --check
node vendor/external/install-web.mjs
```

第一个命令只检查 Node.js 版本不低于 24.9、插件入口、补丁和建筑模式运行模块，不修改 profile。安装脚本会选择仓库里的 IFClite MCP、CAD、Blender、生图和其他 Web 插件。应在服务器自己的源码目录运行；脚本会将该服务器上的包路径写入 profile，插件依赖仍从 npm 注册源安装。版本和上游提交见[第三方源码清单](../../vendor/external/README.md)。

远程部署 Web 时，将 `$DSH_HOME/profiles/web/cordis.patch.yml` 中模型服务和生图工具的 `baseURL` 改为服务器可访问的地址。`127.0.0.1` 指服务器自身。将对应的凭据环境变量配置在服务器上，不要把密钥写进补丁。迁移已有会话和建筑版本时要保留 Harness home；仅复制源码目录不会包含这些数据。先用 `dsh --profile web --dump-config` 检查组合配置，再按[公开部署指南](../../docs/user/guide/public-deployments.zh.md)启动 Web。

无桌面的服务器使用 Blender 无头工具时，需要在本机安装 Blender；无法自动找到时设置 `DSH_BLENDER_EXE`。FreeCAD 操作需要本机安装 FreeCAD，可能还需设置 `FREECAD_BIN`。Fusion 360 的本地桥接不支持 Linux。Blender 浏览器模块默认访问浏览器所在机器的 `127.0.0.1:9877`；GUI 选取集成需要可信隧道连接服务器后端，或在服务器本机运行浏览器。不要将该后端作为无认证公网端点发布。Blender 无头工具不依赖该浏览器集成。

本 bundle 从运行中的 `dsh` 应用入口解析 MCP 客户端和工具定义助手，保证每个 Agent 的注册使用同一套 Host 服务和作用域身份。请通过受支持的 `dsh` profile 命令启动。

使用自定义 `DSH_HOME` 时，应在对应的 Harness home 下创建 `architecture-design` 目录。也可在启动 Web profile 前将 `DSH_ARCH_WORKSPACE` 设为规范化的绝对路径。每个建筑会话在 `architecture-design/sessions` 下拥有独立的 IFClite 进程、输入、输出、简报和版本目录。CAD 和 Blender 仍使用共享工作目录。最后一个建筑预设实例卸载时，会恢复原先的 Blender 工作目录设置。默认的 `review` 工具集提供 40 个 IFC 工具，包括 IDS 审计、静态检查与校验、模型与工程量对比、BCF 问题导出和表格导出。启动前设置 `DSH_ARCH_IFCLITE_TOOL_SET=core` 可使用原有 24 个工具，设置为 `all` 可使用完整 IFClite 工具集。bundle 配置中的 `maxInputBytes` 限制暂存输入大小，`maxDxfHeaderBytes` 限制 DXF 文件头检查的读取量。

## 本地源码改动

[CAD 补丁](patches/dsh-cad-local.patch)记录相对固定上游源码的差异，改动和构建产物已经放在 `vendor/external/dsh-cad`。[Blender 补丁](patches/dsh-blender-plugin-lazy.patch)也已纳入 `vendor/external/dsh-blender-plugin`；在 `autoStart: false` 时，空闲看护不会启动，首次使用需要后端的工具时才会拉起。

## 使用与验证

启动 `dsh --profile web`，新建会话并选择「建筑设计」，将 IFC、IDS 或 DXF 文件放进建筑工作目录。审查前使用 `architecture_stage_file` 把输入复制到当前会话。CAD 页签只在选中建筑会话时出现。`dsh --profile web --dump-config` 可检查预设行；Web 预设列表中「建筑设计」应无加载错误，且「标准模式」仍为默认项。浏览器用户还需要部署方单独配置模型及其凭据。

### 审查 IFC 模型

让建筑设计 Agent 使用唯一模型 ID 加载暂存的 IFC 文件，检查单位、楼层、构件数量和读取警告。它可以执行模型审计和碰撞检查；需要校验信息要求时，提供 IDS 文件并先执行审计和静态检查。发现的问题可以用 GlobalId 标识，并连同选中的构件导出为 BCF 问题。可以要求生成中文 Markdown 报告，记录检查规则、问题、源文件和未能执行的检查。

对于拟议修改，Agent 会列出受影响构件并等待设计师确认。工具审批服务也会在 IFC、CAD 和 Blender 修改前请求确认；没有审批服务时会拒绝执行。IFClite 输出和 `cad_export` 目标必须使用当前会话 `outputs` 目录中的新路径。修改 IFC 后，Agent 导出并以另一个模型 ID 重新加载新 IFC，针对新几何重新执行碰撞检查，并对比模型和工程量。存在待提交修改时会拒绝碰撞检查，因为此时网格没有反映修改。省略 `brief_id` 调用 `architecture_record_version`，可将核对后的 IFC 与 BCF 成果连同文件摘要保存。IFClite 的 PDF 报告工具尚未实现，因此 Agent 使用 Markdown 编写报告。

### 矩形建筑概念方案

先确认用地面积及来源、以米计的建筑长宽、层数、层高和已知的坐标系。收到 DXF 时先暂存，用 `architecture_inspect_dxf_units` 读取声明的单位，再用 `cad_info` 检查图层、范围和实体数量；未知的单位或坐标系需要设计师确认。`architecture_project_brief` 记录已确认的输入和可选暂存源文件的摘要，并按每层相同且不扣除面积的假设计算占地面积、总建筑面积、总高、建筑覆盖率和容积率。这些几何指标不判断当地规划规则。`architecture_generate_scheme` 生成标注毫米尺寸的 DXF 平面轮廓和以米为单位的 OBJ 体量。用 `cad_info` 或 `cad_view` 检查文件后，调用 `architecture_record_version` 将成果和简报复制到带摘要的新版本目录；修订时传入上一版本 ID，再用 `architecture_compare_versions` 核对输入和指标差异。Agent 使用 `present` 交付选定版本的文件和清单。记录简报、生成成果与保存版本均需审批。

Blender 的 GUI 操作需要运行 Blender 并连接随插件提供的 addon；服务器无界面运行可使用插件的 headless worker。一个 profile 内的 CAD 与 Blender 状态仍然共享；如果客户部署要求隔离这些工具，需要分配独立的 profile 进程和工作目录。

建筑会话启动时会启动对应的 IFClite MCP 子进程。缩减工具集可以减少发送给模型的工具声明。
