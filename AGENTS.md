<claude-mem-context>
# Memory Context

# [short_flow] recent context, 2026-07-15 11:56am GMT+8

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
