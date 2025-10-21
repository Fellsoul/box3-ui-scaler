/**
 * UI缩放器 - 两阶段布局（快照 → 依父尺寸重算）
 * 核心思想：先快照原始位置/尺寸/父尺寸，缩放时用百分比重算位置和尺寸
 * 只用 offset，不混用 scale，保证相对位置随父变化对齐
 */

export class UiScaler {
  /**
   * 创建一个 UI 缩放器实例
   * @param {number} ratio - 缩放比例
   */
  constructor(ratio) {
    this.ratio = ratio;
    this.snap = new WeakMap();
    this.snapshotTaken = false;
    this.scaled = new WeakSet(); // 记录已缩放的节点，避免重复缩放
  }

  /**
   * 对外入口：缩放并对齐UI树
   * @param {Object} root - UI根节点
   */
  scaleUI(root) {
    this.applySimpleScale(root);
  }

  /**
   * 简单的全局等比缩放
   * 直接对当前的position和size值进行缩放
   * @param {Object} node - 当前节点
   * @private
   */
  applySimpleScale(node) {
    if (this.isRenderable(node)) {
      const r = node;

      // 检查是否已经缩放过，避免重复缩放
      if (this.scaled.has(r)) {
        // 递归处理子节点
        node.children?.forEach((c) => this.applySimpleScale(c));
        return;
      }

      // 缩放位置
      if (r.position?.offset) {
        const origX = r.position.offset.x;
        const origY = r.position.offset.y;
        r.position.offset.x = Math.round(origX * this.ratio);
        r.position.offset.y = Math.round(origY * this.ratio);
      }

      // 缩放尺寸
      if (r.size?.offset) {
        const origW = r.size.offset.x;
        const origH = r.size.offset.y;
        r.size.offset.x = Math.max(1, Math.round(origW * this.ratio));
        r.size.offset.y = Math.max(1, Math.round(origH * this.ratio));
      }

      // 缩放文本属性
      this.scaleTextIfNeeded(r);

      // 标记已缩放
      this.scaled.add(r);
    }

    // 递归处理子节点
    node.children?.forEach((c) => this.applySimpleScale(c));
  }

  // ——阶段1：快照——
  /**
   * 递归快照整个UI树
   * @param {Object} node - 当前节点
   * @private
   */
  snapshotTree(node) {
    if (this.isRenderable(node)) {
      const r = node;
      const p = node.parent;

      const ow = r.size?.offset?.x ?? 0;
      const oh = r.size?.offset?.y ?? 0;

      const ox = r.position?.offset?.x ?? 0;
      const oy = r.position?.offset?.y ?? 0;

      const opw = p?.size?.offset?.x ?? (ow || 1); // 防除0
      const oph = p?.size?.offset?.y ?? (oh || 1);

      this.snap.set(r, { ox, oy, ow, oh, opw, oph });
    }
    node.children?.forEach((c) => this.snapshotTree(c));
  }

  // ——阶段2：应用缩放——
  /**
   * 递归应用缩放
   * @param {Object} node - 当前节点
   * @param {Object|null} parentRenderable - 父渲染节点（用于计算相对位置）
   * @private
   */
  applyScaleRecursive(node, parentRenderable) {
    if (this.isRenderable(node)) {
      const r = node;
      const s = this.snap.get(r);

      // 计算本节点的目标父尺寸（两种来源：父节点目标尺寸 or 原始父尺寸*ratio）
      let parentW = parentRenderable
        ? (parentRenderable.size?.offset?.x ?? 0)
        : (s?.opw ?? 0) * this.ratio;
      let parentH = parentRenderable
        ? (parentRenderable.size?.offset?.y ?? 0)
        : (s?.oph ?? 0) * this.ratio;

      if (s) {
        // 位置按"相对父尺寸"的百分比重算
        const px = s.opw > 0 ? s.ox / s.opw : 0;
        const py = s.oph > 0 ? s.oy / s.oph : 0;
        const nx = Math.round(px * parentW);
        const ny = Math.round(py * parentH);

        // 尺寸：选择一种策略（推荐使用相对父尺寸，组件会更"响应式"）
        const useRelativeSize = true;
        let nw, nh;
        if (useRelativeSize) {
          const pw = s.opw > 0 ? s.ow / s.opw : 0;
          const ph = s.oph > 0 ? s.oh / s.oph : 0;
          nw = Math.max(1, Math.round(pw * parentW));
          nh = Math.max(1, Math.round(ph * parentH));
        } else {
          nw = Math.max(1, Math.round(s.ow * this.ratio));
          nh = Math.max(1, Math.round(s.oh * this.ratio));
        }

        // 应用（只用 offset，不改 position.scale）
        if (r.position?.offset) {
          r.position.offset.x = nx;
          r.position.offset.y = ny;
        }
        if (r.size?.offset) {
          r.size.offset.x = nw;
          r.size.offset.y = nh;
        }

        // 文本额外缩放
        this.scaleTextIfNeeded(r);

        // 当前节点作为后续子节点的"父目标尺寸"
        parentW = nw;
        parentH = nh;
      }

      // 递归下去：此处把当前渲染节点作为 parentRenderable 传给子节点
      node.children?.forEach((c) => this.applyScaleRecursive(c, r));
      return;
    }

    // 非渲染节点，继续递归但父渲染保持不变
    node.children?.forEach((c) =>
      this.applyScaleRecursive(c, parentRenderable)
    );
  }

  /**
   * 如果是文本节点，缩放字体相关属性
   * @param {Object} r - 可渲染节点
   * @private
   */
  scaleTextIfNeeded(r) {
    const t = r;
    if ('textFontSize' in t) {
      t.textFontSize = Math.max(1, Math.round(t.textFontSize * this.ratio));
      if (t.textLineHeight) {
        t.textLineHeight = Math.round(t.textLineHeight * this.ratio);
      }
      if (t.textStrokeThickness) {
        t.textStrokeThickness = Math.round(t.textStrokeThickness * this.ratio);
      }
    }
  }

  /**
   * 类型守卫：检查节点是否是可渲染元素
   * @param {Object} n - 节点
   * @returns {boolean}
   * @private
   */
  isRenderable(n) {
    const node = n;
    return 'size' in n && 'position' in n && !!node.size && !!node.position;
  }
}
