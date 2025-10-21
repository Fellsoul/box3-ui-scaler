import { UiScaler } from '../src/UiScaler.js';

// 示例UI节点结构
const mockUITree = {
  name: 'root',
  position: {
    offset: { x: 0, y: 0 }
  },
  size: {
    offset: { x: 1920, y: 1080 }
  },
  children: [
    {
      name: 'header',
      position: {
        offset: { x: 0, y: 0 }
      },
      size: {
        offset: { x: 1920, y: 100 }
      },
      children: [
        {
          name: 'title',
          position: {
            offset: { x: 50, y: 25 }
          },
          size: {
            offset: { x: 500, y: 50 }
          },
          textFontSize: 32,
          textLineHeight: 40,
          children: []
        }
      ]
    },
    {
      name: 'content',
      position: {
        offset: { x: 0, y: 100 }
      },
      size: {
        offset: { x: 1920, y: 880 }
      },
      children: []
    }
  ]
};

// 创建缩放器，缩放比例为 0.5（缩小到50%）
const scaler = new UiScaler(0.5);

console.log('原始UI树:', JSON.stringify(mockUITree, null, 2));

// 应用缩放
scaler.scaleUI(mockUITree);

console.log('\n缩放后UI树:', JSON.stringify(mockUITree, null, 2));
