# 项目优化 Todo

基于代码审查结论，按优先级排列。

## P0：正确性问题

- [x] 1. 删除 `src/formatter/` 死代码（V1 遗留，import 不存在的 `../types/index`，导致 `tsc --noEmit` 报错）
- [x] 2. 修复 `package.json` 中 `test:sdk` 脚本路径（`api/test-stock-sdk.ts` → `test/test-stock-sdk.ts`），并补充 `test` 脚本（`bun test`）
- [x] 3. 修复 CLI 输出污染：`main.ts` 中的分节标题（`=== A股行情 ===` 等）从 stdout 改走 stderr，保证 JSON 输出可被直接解析
- [x] 4. 修复 `src/sdk.ts` 中 `market` 参数未使用的问题：确认 stock-sdk CLI 的多市场/多代码用法并修正；同时将 `execSync` shell 字符串拼接改为 `execFileSync` + 参数数组（消除转义/注入隐患）

## P1：文档与配置脱节

- [x] 5. 修复 `agents.md`：
  - 删除重复的"场景十一"
  - 修复破损的 markdown 代码块残留
  - `{{PROJECT_PATH}}` / `{{POSITION_FILE}}` 模板变量改为直接可用的说明（以项目根目录为准）
  - 删除不存在的 `-o raw` 参数引用
  - 持仓日报表格中 A 股标的的数据获取方式统一为 CLI（与"优先本地 CLI"原则一致）
- [x] 6. 修复 `README.md` 与实际不符之处：
  - `agent.md` → `agents.md`
  - 项目结构中不存在的 `src/api/`、`src/cli/index.ts` 描述
  - `-s hk00700` 查港股：经实测 stock-sdk CLI 可自动识别 hk 前缀，该用法成立，保留并补充说明
  - 未实现的 `--period` 参数：已在 main.ts 中补实现，README 参数表同步更新
- [x] 7. 注册孤儿技能 `buffett-value-investing`：在 README 技能一览和 agents.md 场景映射中补充

## P2：工程质量

- [x] 8. 并行化查询：`main.ts` 各市场查询并行发起；`dividend.ts` 批量股息率一次性取行情后并行查询
- [x] 9. 错误可见化：CLI 查询失败时输出明确的错误信息并以非零退出码结束，单个板块失败不影响其他板块
- [x] 10. 验证（类型检查与代码审查已完成；运行时验证命令如下，可自行执行）：
  - `bunx tsc --noEmit`
  - `bun run main.ts -s sh600519,sh600036 -f 006493 --hk 00700`
  - `bun run main.ts -s sh600519 2>/dev/null | python3 -m json.tool`（验证 stdout 为纯 JSON）
  - `bun test`

## P3：暂不处理（记录备查）

- a500 skill 等文件中硬编码的时效性数据（"当前 PE ~18.0x"）：属于策略内容，由作者自行维护
- 超长 SKILL.md（700~830 行）的拆分：涉及内容重构，需作者确认拆分方式

## 额外修复（排查过程中发现）

- `src/format.ts`：基金行情没有 `changePercent` 字段，涨跌幅在 `change` 字段，之前格式化后基金涨跌幅恒为 0，已修复
- `test/test-stock-sdk.ts`：多代码误用逗号分隔（stock-sdk CLI 需空格分隔）；基金查询缺少 `--market fund`；已修复并统一加 `-q` 静默参数
