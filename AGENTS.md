<claude-mem-context>
# Memory Context

# [short_flow] recent context, 2026-07-15 4:12pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 3 obs (672t read) | 0t work

### Jul 1, 2026
1 2:46p 🔵 User offered browser login assistance for session
### Jul 11, 2026
334 3:48p 🔵 nodeCatalog.ts structure analysis for modular split
### Jul 12, 2026
336 1:14p 🔵 Codebase Architecture Analysis Initiated for Short Flow Project
</claude-mem-context>

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `evander-wang/ai_movie_painter`; external PRs are not a triage request surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five-label triage vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain docs layout with root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## 项目工程约束

### 长期开发架构契约

- 本项目固定采用 **DDD-lite + Clean Architecture + Feature/Route 分区**。DDD-lite 用于稳定 AI 视频工作流领域语言和规则，Clean Architecture 用于固定依赖方向，Feature/Route 分区用于组织具体编辑器功能和页面。
- 所有后续修改、重构和新功能都必须先判断业务归属，再选择模块；禁止从 UI 文件开始堆逻辑后再被动拆分。
- 模块设计优先采用深模块：对外暴露小而稳定的 interface，把规则、默认值、校验和复杂实现隐藏在模块内部。只有当行为确实存在多个实现或需要替换时，才新增 seam 和 adapter，禁止为假设中的扩展制造空壳抽象。
- 架构决策以 `docs/adr/` 为准，领域语言以根目录 `CONTEXT.md` 为准。新增核心概念、跨层规则或不可逆技术选择时，必须同步更新领域文档或新增 ADR。

依赖方向必须保持为：

```text
app -> presentation -> application -> domain
                   \-> infrastructure -> domain/shared
application -> application/domain/shared
infrastructure -> infrastructure/domain/shared
shared -> shared/domain
domain -> domain only
```

- 依赖只能沿箭头向内流动，禁止反向 import、跨层捷径和循环依赖。
- `domain` 禁止依赖 React、React Flow、DOM、浏览器 API、Vite、TOML 解析器、存储实现和 presentation 类型。
- `application` 禁止依赖 React、DOM、具体浏览器存储、下载实现和 presentation；用例通过参数接收所需数据或能力，并返回结果。
- `infrastructure` 只实现浏览器、存储、文件、配置等外部能力，不承载工作流业务判断，不反向调用 application 或 presentation。
- `presentation` 可以组合 application use case 和 infrastructure adapter，但不得把领域规则复制到组件、hook、panel 或 React Flow 回调里。
- `app` 只负责启动、路由、Provider 和页面组合；`presentation` 不得反向依赖 `app`。
- `.dependency-cruiser.cjs` 是依赖方向的强制门禁。新增目录或改变分层时必须同步维护规则，不能通过相对路径、barrel 或类型文件绕过检查。

### 各层职责

- `src/app/`：应用启动、顶层路由、Provider、页面装配。不得放节点规则、画布算法和具体面板实现。
- `src/config/`：集中读取并校验 `config/app.toml`，向外提供类型明确的只读配置。组件不得直接读取环境变量或硬编码端口、默认视口等项目配置。
- `src/domain/`：实体、值对象、联合类型、领域规则、节点目录、连接规则、默认画布等纯业务模型。输出必须确定、可序列化、可脱离 React 单测。
- `src/application/`：面向用户意图的 use case，例如创建节点、连接节点、整理画布、计算 Active Path、导入导出和草稿恢复。负责流程编排，不负责 DOM 和视觉渲染。
- `src/infrastructure/`：localStorage、文件导入下载、DOM 几何、浏览器事件、配置解析等 adapter。外部数据进入应用前必须在这里或 application 边界完成解析和校验。
- `src/presentation/`：页面、React 组件、React Flow node/edge adapter、controller hook、panel、overlay、toolbar 和 presenter。只负责展示状态、收集交互、调用 use case。
- `src/shared/`：真正跨领域、低层、纯函数的能力。业务含义明确的代码不得为了“复用”放入 shared。
- `src/styles/`：token、基础样式及按 UI 领域拆分的样式。颜色、字号、圆角、阴影、间距和层级必须优先使用 token。

### 新功能开发顺序

实现新功能时按以下顺序落位；某一步确实不需要时可以省略，但不得把职责合并到错误层：

1. 在 `CONTEXT.md` 或现有领域模型中确认术语、实体、状态和不变量。
2. 在 `src/domain/<context>/` 定义类型与纯规则；规则应返回结果，不直接触发 UI、存储或网络副作用。
3. 在 `src/application/<context>/` 定义一个以用户意图命名的 use case，组合领域规则并明确输入、输出和错误结果。
4. 需要浏览器、文件、存储或配置能力时，在 `src/infrastructure/` 提供 adapter，由 presentation 在组合点注入或调用。
5. 在 `src/presentation/<feature>/` 增加 presenter/controller 和视图；复杂状态转换放 presenter 或 hook，React 组件保持声明式。
6. 需要新页面或深链接时，在 `src/app/` 注册路由；可分享、可刷新恢复的状态进入 URL，短暂交互状态留在 presentation。
7. 根据变更层级补齐 domain/application 单测、golden baseline 或 Playwright 用户流程测试。

推荐的新功能切片结构：

```text
src/domain/workflow/<rule-or-model>.ts
src/application/workflow/<verb><Noun>.ts
src/infrastructure/<capability>/<adapter>.ts
src/presentation/editor/<feature>/
tests/application/<use-case>.test.ts
tests/presentation/<presenter-or-registry>.test.ts
tests/e2e/<user-flow>.spec.ts
```

### 状态与数据流

- 单向数据流固定为：用户交互 -> presentation controller -> application use case -> domain rule -> 新状态/result -> presentation 渲染。
- Workflow、Node、Edge、Viewport 等产品状态使用项目领域类型；React Flow 的 `Node`、`Edge`、事件对象只允许停留在 `presentation/editor/reactflow` adapter 一侧。
- `selected node`、`active panel`、项目/画布标识等需要分享或刷新恢复的状态由路由查询参数或路径表达；hover、拖拽中、弹框临时位置等瞬时状态留在 presentation。
- 草稿、导入导出和默认画布必须使用同一套 versioned Import/Export Schema。持久化实现属于 infrastructure，迁移、校验和恢复流程属于 application，schema 不得在组件中临时拼装。
- 不允许存在两个互相同步的事实来源。派生数据优先通过纯函数或 memo 计算，禁止用 effect 在多个 state 之间来回镜像，这也是防止 React Maximum update depth 的硬约束。
- 浏览器副作用集中在 adapter 或明确的 presentation effect 中；render 期间禁止写 URL、存储、viewport 或 React Flow store。

### 模块 interface 约束

- 每个模块应有一个清晰的对外 interface；调用方只依赖输入、输出、不变量和错误模式，不依赖内部文件组织。
- 优先通过命名明确的函数和判别联合返回业务结果，避免用布尔值、魔法字符串或异常表达正常业务分支。
- 默认值、校验、去重、连接方向、版本迁移等知识必须集中在一个权威模块中，禁止多个调用方各写一份近似实现。
- presenter 负责把领域/application 结果转换为 ViewModel；React 组件不得重复格式化、分组或推导同一份业务数据。
- barrel 文件只用于稳定聚合导出，不能隐藏跨层依赖，也不能把整个目录全部暴露为公共 interface。

### React 与 React Flow 约束

- React 组件只接收渲染所需 props，并通过事件回调表达用户意图；不得直接修改 domain 对象。
- controller hook 负责页面级状态和 use case 编排，按 Selection、Connections、Node Actions、Canvas Commands、Panels 等能力拆分，禁止重新形成巨型 controller。
- nodeTypes、edgeTypes、node renderer、edge renderer 必须保持稳定引用；传给 React Flow 的 nodes、edges 和回调需避免无意义重建，防止 StoreUpdater 循环和大画布性能退化。
- 节点属性弹框、抽屉和工具栏采用 shell + registry/presenter + feature panel 结构；新增节点类型时通过目录和注册表扩展，禁止在单个组件里追加长条件分支。
- 大画布动画只作用于选中节点或 Active Path，默认边保持轻量；任何新增逐帧动画都必须评估节点/边数量增长后的渲染成本。

### 测试与完成标准

- `domain` 规则和 `application` use case 必须优先使用确定性单元测试，测试通过公开 interface，不穿透内部实现。
- 默认画布、节点目录、配置和 Import/Export Schema 等稳定结构使用 golden test；baseline 变化必须经过人工确认，并通过 `UPDATE_GOLDEN=1 npm run test:golden` 显式更新。
- presenter、registry、路由状态解析等 UI 纯逻辑使用 Vitest；节点点击、弹框关闭、添加节点、自动连线、导入导出、草稿恢复、缩放整理等关键用户路径使用 Playwright。
- 修复线上或交互 bug 时必须先补能复现问题的回归测试，再修实现；禁止只依赖人工点击确认。
- 任何架构重构必须保持可见行为和数据格式不变，除非需求明确要求行为变化。
- 完成开发前至少运行与改动范围匹配的测试；涉及跨层、路由、React Flow、持久化或公共 schema 时必须运行 `npm run check:all`。
- 功能完成的定义：类型检查通过、依赖检查通过、相关测试通过、无新增循环依赖、无局部视觉魔法值、领域文档与 ADR 在需要时已更新。

### 明确禁止的架构模式

- 禁止在 `App.tsx`、`EditorPage.tsx`、节点组件或属性面板中直接实现领域规则、导入导出 schema、localStorage 格式或自动整理算法。
- 禁止为了少建文件而把领域类型、use case、浏览器副作用和 JSX 放在同一模块。
- 禁止从 domain/application import React Flow 类型，或让领域模型继承第三方库类型。
- 禁止组件直接读写 localStorage、直接拼导出 JSON、直接维护 URL 与 selection 的双向 effect 循环。
- 禁止通过 `any`、无约束类型断言或复制类型定义绕过跨层契约。
- 禁止新增只做参数转发、没有隐藏复杂度的浅模块；拆分必须提升 interface 稳定性、测试性或知识局部性。
- 禁止为未来可能出现的第二种实现预建 repository、factory、manager 等抽象；出现真实变化点后再建立 seam。

### 架构分层

- 当前项目按 AI 视频工作流画布产品开发，优先使用 DDD 的领域边界组织代码。
- 新增或重构代码时，按职责拆到独立模块，不把领域规则、画布编排、UI 组件、配置读取、导入导出逻辑继续堆进单个大文件。
- 推荐目录边界：
  - `src/domain/`：领域模型、节点类型、连线类型、工作流规则、默认画布结构。
  - `src/application/`：画布整理、导入导出、节点创建、选中路径计算等用例服务。
  - `src/infrastructure/`：TOML 配置读取、本地文件导入导出、浏览器 API 适配。
  - `src/presentation/`：React 组件、hooks、面板、弹框、工具栏、React Flow 适配。
  - `src/shared/`：通用类型、断言、稳定 JSON、几何计算、纯工具函数。

### 模块拆分规则

- 能独立的领域能力必须独立：节点目录、默认画布、边动画策略、弹框定位、导入导出 schema、自动整理算法都应是可单测的纯模块。
- React 组件只负责渲染和交互编排；复杂计算必须提取到 hook、use case 或 domain/helper。
- `App.tsx` 只作为组合入口，避免承载业务规则。新增代码优先放到明确模块，再由入口组合。
- 单个文件超过约 300 行时需要主动评估拆分；超过 500 行时除非是纯数据表，否则应拆分。
- 单个函数优先控制在 40 行以内；超过 60 行时必须考虑拆成命名清晰的小函数或 use case。
- 单个 React 组件优先控制在 150 行以内；复杂弹框、面板、节点卡片必须拆成子组件。

### 领域语言

- 使用统一领域词：Workflow、Canvas、Node、Edge、Handle、Viewport、Attribute Panel、Node Catalog、Default Canvas、Import/Export Schema、Active Path。
- 节点类型、节点属性、状态枚举要集中定义，避免在 UI 层散落字符串。
- 默认画布、导入导出、golden baseline 使用同一套领域模型，避免测试里复制一份业务结构。

### 质量约束

- 优先写纯函数和确定性输出，便于 golden test 和单元测试覆盖。
- 新增可观察行为时，同步考虑是否需要更新 golden baseline；只能通过 `UPDATE_GOLDEN=1 npm run test:golden` 显式更新。
- UI token、字号、颜色、圆角、阴影统一从样式 token 或配置入口使用，禁止随手新增局部魔法值。
- 配置优先进入 `config/app.toml` 和集中读取层，禁止在组件里散落环境读取或硬编码端口。
- 重构必须保持用户可见行为不退化；拆模块时优先做无行为变化的小步迁移，并运行 `npm run check:all`。
