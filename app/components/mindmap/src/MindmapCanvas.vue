<script setup lang="ts">
import type { Cell, Node } from "@antv/x6";
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";
import { Graph, Keyboard, Path, Selection } from "@antv/x6";
import Hierarchy from "@antv/hierarchy";

/** 思维导图节点类型 */
type MindmapNodeType = "topic" | "topic-branch" | "topic-child";

/** 思维导图节点数据（树形结构） */
interface MindmapData {
  id: string;
  type: MindmapNodeType;
  label: string;
  width: number;
  height: number;
  children?: MindmapData[];
}

/** Hierarchy 布局结果 */
interface HierarchyResult {
  id: string;
  x: number;
  y: number;
  data: MindmapData;
  children?: HierarchyResult[];
}

const model = defineModel<MindmapData>({
  default: () => ({
    id: "1",
    type: "topic",
    label: "中心主题",
    width: 160,
    height: 50,
    children: []
  })
});

/** 记录最近一次由内部回写的数据引用，避免循环更新 */
let lastEmittedData: MindmapData | null = null;

/** 画布容器 */
const graphContainerRef = ref<HTMLDivElement | null>(null);

let graph: Graph | null = null;
/** 防抖定时器，合并频繁的画布变更 */
let emitTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 注册自定义节点、边、连接器。
 * 对应 demo2.js 中的 registerNode / registerConnector / registerEdge。
 */
const registerShapes = (): void => {
  // 中心主题或分支主题
  Graph.registerNode(
    "topic",
    {
      inherit: "rect",
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image", selector: "img" },
        { tagName: "text", selector: "label" }
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          stroke: "#5F95FF",
          fill: "#EFF4FF",
          strokeWidth: 1
        },
        img: {
          ref: "body",
          refX: "100%",
          refY: "50%",
          refY2: -8,
          width: 16,
          height: 16,
          "xlink:href":
            "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SYCuQ6HHs5cAAAAAAAAAAAAAARQnAQ",
          event: "add:topic",
          class: "topic-image"
        },
        label: {
          fontSize: 14,
          fill: "#262626"
        }
      }
    },
    true
  );

  // 子主题
  Graph.registerNode(
    "topic-child",
    {
      inherit: "rect",
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "text", selector: "label" },
        { tagName: "path", selector: "line" }
      ],
      attrs: {
        body: {
          fill: "#ffffff",
          strokeWidth: 0,
          stroke: "#5F95FF"
        },
        label: {
          fontSize: 14,
          fill: "#262626",
          textVerticalAnchor: "bottom"
        },
        line: {
          stroke: "#5F95FF",
          strokeWidth: 2,
          d: "M 0 15 L 60 15"
        }
      }
    },
    true
  );

  // 自定义连接器（贝塞尔曲线）
  Graph.registerConnector(
    "mindmap",
    (sourcePoint, targetPoint, _routerPoints, options) => {
      const midX = sourcePoint.x + 10;
      const midY = sourcePoint.y;
      const ctrX = (targetPoint.x - midX) / 5 + midX;
      const ctrY = targetPoint.y;
      const pathData = `
       M ${sourcePoint.x} ${sourcePoint.y}
       L ${midX} ${midY}
       Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
      `;
      return options.raw ? Path.parse(pathData) : pathData;
    },
    true
  );

  // 思维导图边
  Graph.registerEdge(
    "mindmap-edge",
    {
      inherit: "edge",
      connector: { name: "mindmap" },
      attrs: {
        line: {
          targetMarker: "",
          stroke: "#A2B1C3",
          strokeWidth: 2
        }
      },
      zIndex: 0
    },
    true
  );
};

/** 初始化画布 */
const initGraph = (): void => {
  if (!graphContainerRef.value) return;

  graph = new Graph({
    container: graphContainerRef.value,
    connecting: {
      connectionPoint: "anchor"
    }
  });

  graph.use(new Selection());
  graph.use(new Keyboard());

  bindEvents();
  bindShortcuts();
};

/** 根据 model 数据渲染整棵思维导图树 */
const render = (): void => {
  if (!graph) return;
  const data = toRaw(model.value);
  const result: HierarchyResult = Hierarchy.mindmap(data, {
    direction: "H",
    getHeight(d: MindmapData) {
      return d.height;
    },
    getWidth(d: MindmapData) {
      return d.width;
    },
    getHGap() {
      return 40;
    },
    getVGap() {
      return 20;
    },
    getSide: () => "right"
  });

  const cells: Cell[] = [];
  const traverse = (hierarchyItem: HierarchyResult): void => {
    if (!hierarchyItem) return;
    const { data: nodeData, children } = hierarchyItem;
    cells.push(
      graph!.createNode({
        id: nodeData.id,
        shape: nodeData.type === "topic-child" ? "topic-child" : "topic",
        x: hierarchyItem.x,
        y: hierarchyItem.y,
        width: nodeData.width,
        height: nodeData.height,
        label: nodeData.label,
        type: nodeData.type
      })
    );
    if (children) {
      children.forEach((item: HierarchyResult) => {
        const { id, data: childData } = item;
        cells.push(
          graph!.createEdge({
            shape: "mindmap-edge",
            source: {
              cell: hierarchyItem.id,
              anchor:
                childData.type === "topic-child"
                  ? { name: "right", args: { dx: -16 } }
                  : { name: "center", args: { dx: "25%" } }
            },
            target: { cell: id, anchor: { name: "left" } }
          })
        );
        traverse(item);
      });
    }
  };
  traverse(result);
  graph.resetCells(cells);
  graph.centerContent();
};

/**
 * 在树形数据中查找指定 id 的节点及其父节点。
 * @param obj - 根节点
 * @param id - 目标节点 id
 */
const findItem = (
  obj: MindmapData,
  id: string
): { parent: MindmapData | null; node: MindmapData | null } | null => {
  if (obj.id === id) {
    return { parent: null, node: obj };
  }
  const { children } = obj;
  if (children) {
    for (let i = 0, len = children.length; i < len; i += 1) {
      const res = findItem(children[i], id);
      if (res) {
        return { parent: res.parent || obj, node: res.node };
      }
    }
  }
  return null;
};

/**
 * 为指定节点添加子节点。
 * @param id - 父节点 id
 * @param type - 父节点类型，决定新增子节点的类型
 */
const addChildNode = (id: string, type: MindmapNodeType): MindmapData | null => {
  const res = findItem(toRaw(model.value), id);
  const dataItem = res?.node;
  if (!dataItem) return null;

  let item: MindmapData | null = null;
  const length = dataItem.children ? dataItem.children.length : 0;
  if (type === "topic") {
    item = {
      id: `${id}-${length + 1}`,
      type: "topic-branch",
      label: `分支主题${length + 1}`,
      width: 100,
      height: 40
    };
  } else if (type === "topic-branch") {
    item = {
      id: `${id}-${length + 1}`,
      type: "topic-child",
      label: `子主题${length + 1}`,
      width: 60,
      height: 30
    };
  }
  if (item) {
    if (dataItem.children) {
      dataItem.children.push(item);
    } else {
      dataItem.children = [item];
    }
  }
  return item;
};

/** 删除指定 id 的节点（从其父节点的 children 中移除） */
const removeNode = (id: string): MindmapData[] | null => {
  const res = findItem(toRaw(model.value), id);
  const dataItem = res?.parent;
  if (dataItem && dataItem.children) {
    const { children } = dataItem;
    const index = children.findIndex((item) => item.id === id);
    if (index >= 0) {
      return children.splice(index, 1);
    }
  }
  return null;
};

/** 绑定画布事件（点击 + 号图片添加子节点） */
const bindEvents = (): void => {
  if (!graph) return;
  graph.on("add:topic", ({ node }: { node: Node }) => {
    const { id } = node;
    const type = node.prop<MindmapNodeType>("type");
    if (id && type && addChildNode(id, type)) {
      render();
      scheduleEmit();
    }
  });
};

/** 绑定快捷键（Tab 新增子节点，Backspace/Delete 删除选中节点） */
const bindShortcuts = (): void => {
  if (!graph) return;

  graph.bindKey(["backspace", "delete"], () => {
    const selectedNodes = graph!.getSelectedCells().filter((item) => item.isNode());
    if (selectedNodes.length) {
      const { id } = selectedNodes[0];
      if (id && removeNode(id)) {
        render();
        scheduleEmit();
      }
    }
    return false;
  });

  graph.bindKey("tab", (e) => {
    e.preventDefault();
    const selectedNodes = graph!.getSelectedCells().filter((item) => item.isNode());
    if (selectedNodes.length) {
      const node = selectedNodes[0];
      const type = node.prop<MindmapNodeType>("type");
      if (node.id && type && addChildNode(node.id, type)) {
        render();
        scheduleEmit();
      }
    }
    return false;
  });
};

/** 防抖回写 v-model */
const scheduleEmit = (): void => {
  if (emitTimer) clearTimeout(emitTimer);
  emitTimer = setTimeout(() => {
    const data = toRaw(model.value);
    // 深拷贝断开响应式引用，避免外部修改直接污染内部树
    const cloned: MindmapData = JSON.parse(JSON.stringify(data));
    lastEmittedData = cloned;
    model.value = cloned;
  }, 200);
};

/**
 * 从外部数据加载到思维导图（会重新渲染整棵树）。
 * @param data - 思维导图树形数据
 */
const importData = (data: MindmapData): void => {
  model.value = data;
  render();
  scheduleEmit();
};

/** 导出当前思维导图数据 */
const exportData = (): MindmapData => {
  return JSON.parse(JSON.stringify(toRaw(model.value))) as MindmapData;
};

defineExpose({ importData, exportData });

onMounted(() => {
  registerShapes();
  initGraph();
  render();
});

// 监听外部 v-model 变化，避免内部回写的数据再次触发渲染
watch(model, (newVal) => {
  if (toRaw(newVal) === lastEmittedData) return;
  render();
});

onBeforeUnmount(() => {
  if (emitTimer) clearTimeout(emitTimer);
  graph?.dispose();
  graph = null;
});
</script>

<template>
  <div ref="graphContainerRef" class="mindmap-canvas"></div>
</template>

<style scoped lang="scss">
.mindmap-canvas {
  width: 100%;
  height: 100%;
}
</style>

<style lang="scss">
/* 思维导图节点样式覆写（非 scoped，作用于全局 x6 控件） */
.topic-image {
  visibility: hidden;
  cursor: pointer;
}
.x6-node:hover .topic-image {
  visibility: visible;
}
.x6-node-selected rect {
  stroke-width: 2px;
}
</style>
