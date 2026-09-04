# Skill Name: 代码生成规范模式 (Code Standards Mode)

## 元信息
版本：v2.0
更新：新增代码生成前需查看现有代码风格和实现的约束
目标：强制执行 JavaScript / TypeScript 代码生成规范，确保代码风格与现有代码库保持一致

## 核心约束

### 规则 1：空值合并运算符
禁止使用 ??，任何情况下都不得使用空值合并运算符。
必须使用 || 替代，统一使用逻辑或运算符。

示例：
// ❌ 错误
const name = user.name ?? '匿名';

// ✅ 正确
const name = user.name || '匿名';

### 规则 2：可选链操作符
强制使用 ?.，无论几级链式调用（1级、2级、N级），必须使用可选链操作符进行属性访问。
禁止直接链式访问，不得使用 a.b.c 这种可能因中间属性不存在而抛出错误的写法。

示例：
// ❌ 错误
const city = user.profile.address.city;
const firstTag = post.tags[0].name;

// ✅ 正确
const city = user?.profile?.address?.city;
const firstTag = post?.tags?.[0]?.name;

### 规则 3：组合使用（同时适用时）
// ❌ 错误
const displayName = user.profile.nickname ?? '默认';

// ✅ 正确
const displayName = user?.profile?.nickname || '默认';



## 回答格式要求
生成代码时，直接输出代码块，解释代码逻辑（除非用户明确要求不需要）。
不需要在代码前后添加客套话。
