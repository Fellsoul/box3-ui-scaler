# box3-ui-scaler

神岛轻量级UI缩放工具，支持神岛UI节点位置、尺寸和文本属性的智能等比缩放。用于pc端/移动端UI界面适配

## ✨ 特性

- 🎯 **智能缩放** - 自动处理位置、尺寸和文本属性
- 📦 **零依赖** - 纯JavaScript实现，无外部依赖
- 🚀 **高性能** - 使用WeakMap和WeakSet优化性能
- 🔄 **防重复缩放** - 自动防止同一节点被多次缩放
- 📏 **精确计算** - 使用百分比重算保证相对位置对齐
- 💪 **TypeScript支持** - 提供完整的类型定义

## 📦 安装

### npm 安装

```bash
npm install box3-ui-scaler
```

## 🚀 使用方法

> ⚠️ **重要提示**: 不要直接对 `UiScreen` 进行缩放，应该对 `UiScreen` 下的子节点（如 `uiBox_windowAnchorMiddle`）进行缩放。

### NPM 方式

#### ES Module

```javascript
import { UiScaler } from 'box3-ui-scaler';

// 创建缩放器实例，缩放比例为 0.5（缩小到50%）
const scaler = new UiScaler(0.5);

// 目标UI树根节点 (注意：不可以是UiScreen，必须是UiScreen下的子节点)
const targetUiRoot = yourUiNode; // 替换为你的实际UI节点

// 应用缩放
scaler.scaleUI(targetUiRoot);

console.log('缩放后的UI树:', targetUiRoot);
```

#### 原生 JavaScript 方式

#### 1. 下载源文件

下载 `src/UiScaler.js` 文件到你的项目中。

#### 2. 直接引入使用

```javascript

// 方式1：相对路径引入
import { UiScaler } from './path/to/UiScaler.js';

// 创建UI树
const uiTree = {
  name: 'root',
  position: { offset: { x: 0, y: 0 } },
  size: { offset: { x: 1920, y: 1080 } },
  children: [
    {
      name: 'header',
      position: { offset: { x: 0, y: 0 } },
      size: { offset: { x: 1920, y: 100 } },
      textFontSize: 24,
      children: []
    }
  ]
};

// 根据屏幕大小计算缩放比例
const targetWidth = window.innerWidth;
const originalWidth = 1920;
const ratio = targetWidth / originalWidth;

// 创建缩放器并应用
const scaler = new UiScaler(ratio);
scaler.scaleUI(uiTree);

console.log('缩放后:', uiTree);
```

#### 3. 使用CDN（如果发布到npm）

```html
<script type="module">
  import { UiScaler } from 'https://unpkg.com/box3-ui-scaler/dist/UiScaler.esm.js';
  
  const scaler = new UiScaler(0.5);
  scaler.scaleUI(yourUITree);
</script>
```

## 📖 API 文档

### `UiScaler`

#### 构造函数

```javascript
new UiScaler(ratio: number)
```

**参数:**

- `ratio` - 缩放比例（例如：0.5 表示缩小到50%，2.0 表示放大到200%）

#### 方法

##### `scaleUI(root)`

对UI树进行缩放。

**参数:**

- `root` - UI根节点对象（⚠️ 注意：不能是 `UiScreen`，必须是其子节点）

**返回值:** 无（直接修改传入的对象）

**示例:**
```javascript
// ✅ 正确
scaler.scaleUI(uiScreen.uiBox_windowAnchorMiddle);

// ❌ 错误 - 不要直接缩放 UiScreen
scaler.scaleUI(uiScreen);
```

## 💡 使用示例

### 响应式适配

```javascript
const scaler = new UiScaler(this.screenScaleRatio);
// 缩放并对齐windowMiddleAnchor下树形ui
const windowAnchorMiddle = uiScreen.uiBox_windowAnchorMiddle as unknown as UiNode;
if (windowAnchorMiddle) {
    console.log('Scaling windowAnchorMiddle and its children');
    scaler.scaleUI(windowAnchorMiddle);
}
```

### 动态缩放

```javascript
import { UiScaler } from 'box3-ui-scaler';

let currentRatio = 1.0;

function handleResize() {
  const newRatio = window.innerWidth / 1920;
  
  // 只有比例变化时才重新缩放
  if (newRatio !== currentRatio) {
    currentRatio = newRatio;
    const scaler = new UiScaler(currentRatio);
    
    // 获取UI节点并缩放（不能直接缩放uiScreen）
    const uiRoot = uiScreen.uiBox_windowAnchorMiddle;
    if (uiRoot) {
      scaler.scaleUI(uiRoot);
      // 更新你的UI渲染
      updateUIRender(uiRoot);
    }
  }
}

window.addEventListener('resize', handleResize);
```

### ⚙️ 工作原理

`ui-scaler` 采用智能的等比缩放算法：

1. **直接缩放**: 对节点的位置、尺寸和文本属性进行等比缩放
2. **防重复处理**: 使用 WeakSet 跟踪已缩放的节点，避免重复缩放
3. **精确计算**: 使用 Math.round 确保像素对齐
4. **递归处理**: 自动处理整个UI树的所有子节点

## ❓ 常见问题

### 为什么不能直接缩放 UiScreen？

`UiScreen` 是神岛的顶层屏幕容器，直接缩放它可能会导致整个UI系统出现问题。正确的做法是缩放 `UiScreen` 下的具体锚点容器，例如：

- `uiScreen.uiBox_windowAnchorMiddle` - 窗口中间锚点
- `uiScreen.uiBox_windowAnchorLeft` - 窗口左侧锚点
- `uiScreen.uiBox_windowAnchorRight` - 窗口右侧锚点
- 等等...

**示例：**
```javascript
const scaler = new UiScaler(0.75);

// ✅ 正确 - 缩放具体的锚点容器
scaler.scaleUI(uiScreen.uiBox_windowAnchorMiddle);

// ❌ 错误 - 不要这样做
scaler.scaleUI(uiScreen);
```

### 如何获取UI节点？

在神岛项目中，通常通过 `uiScreen` 的属性访问UI节点：

```javascript
// 获取中间锚点的UI容器
const middleBox = uiScreen.uiBox_windowAnchorMiddle;

// 如果使用 TypeScript，可能需要类型断言
const middleBox = uiScreen.uiBox_windowAnchorMiddle as unknown as UiNode;
```

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```
