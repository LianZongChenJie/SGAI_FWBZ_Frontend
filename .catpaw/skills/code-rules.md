# Skill Name: 代码生成规范模式 (Code Standards Mode)

## 元信息
版本：v1.0
目标：强制执行 JavaScript / TypeScript 代码生成规范

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

