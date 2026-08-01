<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";
import {
  Clipboard,
  Graph,
  History,
  Keyboard,
  Selection,
  Shape,
  Snapline,
  Stencil,
  Transform
} from "@antv/x6";

/** 流程图数据（x6 toJSON 结构） */
type FlowchartData = { cells: Record<string, unknown>[] };

const model = defineModel<FlowchartData>({
  default: () => ({ cells: [] })
});

/** 记录最近一次由内部回写的数据引用，避免循环更新 */
let lastEmittedData: FlowchartData | null = null;

/** 画布容器 */
const graphContainerRef = ref<HTMLDivElement | null>(null);
/** stencil 模板容器 */
const stencilContainerRef = ref<HTMLDivElement | null>(null);

let graph: Graph | null = null;
let stencil: Stencil | null = null;
/** 防抖定时器，合并频繁的画布变更 */
let emitTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 控制连接桩显示/隐藏
 * @param ports - 连接桩 DOM 列表
 * @param show - 是否显示
 */
const showPorts = (ports: NodeListOf<SVGElement>, show: boolean): void => {
  for (let i = 0, len = ports.length; i < len; i += 1) {
    ports[i].style.visibility = show ? "visible" : "hidden";
  }
};

/** 注册自定义节点 */
const registerNodes = (): void => {
  /** 四向连接桩配置 */
  const ports = {
    groups: {
      top: {
        position: "top",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: { visibility: "hidden" }
          }
        }
      },
      right: {
        position: "right",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: { visibility: "hidden" }
          }
        }
      },
      bottom: {
        position: "bottom",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: { visibility: "hidden" }
          }
        }
      },
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: { visibility: "hidden" }
          }
        }
      }
    },
    items: [{ group: "top" }, { group: "right" }, { group: "bottom" }, { group: "left" }]
  };

  // 圆角矩形（开始/过程/可选过程）
  Graph.registerNode(
    "custom-rect",
    {
      inherit: "rect",
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF"
        },
        text: {
          fontSize: 12,
          fill: "#262626"
        }
      },
      ports: { ...ports }
    },
    true
  );

  // 多边形（决策/数据）
  Graph.registerNode(
    "custom-polygon",
    {
      inherit: "polygon",
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF"
        },
        text: {
          fontSize: 12,
          fill: "#262626"
        }
      },
      ports: {
        ...ports,
        items: [{ group: "top" }, { group: "bottom" }]
      }
    },
    true
  );

  // 圆形（连接）
  Graph.registerNode(
    "custom-circle",
    {
      inherit: "circle",
      width: 45,
      height: 45,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#EFF4FF"
        },
        text: {
          fontSize: 12,
          fill: "#262626"
        }
      },
      ports: { ...ports }
    },
    true
  );

  // 图片节点（系统设计图）
  Graph.registerNode(
    "custom-image",
    {
      inherit: "rect",
      width: 52,
      height: 52,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image" },
        { tagName: "text", selector: "label" }
      ],
      attrs: {
        body: {
          stroke: "#5F95FF",
          fill: "#5F95FF"
        },
        image: {
          width: 26,
          height: 26,
          refX: 13,
          refY: 16
        },
        label: {
          refX: 3,
          refY: 2,
          textAnchor: "left",
          textVerticalAnchor: "top",
          fontSize: 12,
          fill: "#fff"
        }
      },
      ports: { ...ports }
    },
    true
  );
};

/** 加载 stencil 模板节点 */
const loadStencilNodes = (): void => {
  if (!graph || !stencil) return;

  // 基础流程图
  const r1 = graph.createNode({
    shape: "custom-rect",
    label: "开始",
    attrs: { body: { rx: 20, ry: 26 } }
  });
  const r2 = graph.createNode({
    shape: "custom-rect",
    label: "过程"
  });
  const r3 = graph.createNode({
    shape: "custom-rect",
    attrs: { body: { rx: 6, ry: 6 } },
    label: "可选过程"
  });
  const r4 = graph.createNode({
    shape: "custom-polygon",
    attrs: { body: { refPoints: "0,10 10,0 20,10 10,20" } },
    label: "决策"
  });
  const r5 = graph.createNode({
    shape: "custom-polygon",
    attrs: { body: { refPoints: "10,0 40,0 30,20 0,20" } },
    label: "数据"
  });
  const r6 = graph.createNode({
    shape: "custom-circle",
    label: "连接"
  });
  stencil.load([r1, r2, r3, r4, r5, r6], "group1");

  // 系统设计图
  const imageShapes = [
    {
      label: "Client",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg"
    },
    {
      label: "Http",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg"
    },
    {
      label: "Api",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg"
    },
    {
      label: "Sql",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg"
    },
    {
      label: "Clound",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg"
    },
    {
      label: "Mq",
      image: "https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg"
    }
  ];
  const imageNodes = imageShapes.map((item) =>
    graph!.createNode({
      shape: "custom-image",
      label: item.label,
      attrs: { image: { "xlink:href": item.image } }
    })
  );
  stencil.load(imageNodes, "group2");
};

/** 初始化画布 */
const initGraph = (): void => {
  if (!graphContainerRef.value) return;

  graph = new Graph({
    container: graphContainerRef.value,
    grid: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3
    },
    connecting: {
      router: "manhattan",
      connector: {
        name: "rounded",
        args: { radius: 8 }
      },
      anchor: "center",
      connectionPoint: "anchor",
      allowBlank: false,
      snap: { radius: 20 },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#A2B1C3",
              strokeWidth: 2,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8
              }
            }
          },
          zIndex: 0
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF"
          }
        }
      }
    }
  });

  // 注册插件
  graph
    .use(
      new Transform({
        resizing: true,
        rotating: true
      })
    )
    .use(
      new Selection({
        rubberband: true,
        showNodeSelectionBox: true
      })
    )
    .use(new Snapline())
    .use(new Keyboard())
    .use(new Clipboard())
    .use(new History());

  // 绑定快捷键
  bindShortcuts();
  // 绑定连接桩显示/隐藏
  bindPortVisibility();
  // 绑定画布变更回写 v-model
  bindDataSync();
};

/** 绑定快捷键 */
const bindShortcuts = (): void => {
  if (!graph) return;

  // 复制
  graph.bindKey(["meta+c", "ctrl+c"], () => {
    const cells = graph!.getSelectedCells();
    if (cells.length) {
      graph!.copy(cells);
    }
    return false;
  });
  // 剪切
  graph.bindKey(["meta+x", "ctrl+x"], () => {
    const cells = graph!.getSelectedCells();
    if (cells.length) {
      graph!.cut(cells);
    }
    return false;
  });
  // 粘贴
  graph.bindKey(["meta+v", "ctrl+v"], () => {
    if (!graph!.isClipboardEmpty()) {
      const cells = graph!.paste({ offset: 32 });
      graph!.cleanSelection();
      graph!.select(cells);
    }
    return false;
  });
  // 撤销
  graph.bindKey(["meta+z", "ctrl+z"], () => {
    if (graph!.canUndo()) {
      graph!.undo();
    }
    return false;
  });
  // 重做
  graph.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
    if (graph!.canRedo()) {
      graph!.redo();
    }
    return false;
  });
  // 全选
  graph.bindKey(["meta+a", "ctrl+a"], () => {
    const nodes = graph!.getNodes();
    if (nodes) {
      graph!.select(nodes);
    }
  });
  // 删除
  graph.bindKey("backspace", () => {
    const cells = graph!.getSelectedCells();
    if (cells.length) {
      graph!.removeCells(cells);
    }
  });
  // 放大
  graph.bindKey(["ctrl+1", "meta+1"], () => {
    const zoom = graph!.zoom();
    if (zoom < 1.5) {
      graph!.zoom(0.1);
    }
  });
  // 缩小
  graph.bindKey(["ctrl+2", "meta+2"], () => {
    const zoom = graph!.zoom();
    if (zoom > 0.5) {
      graph!.zoom(-0.1);
    }
  });
};

/** 绑定连接桩显示/隐藏事件 */
const bindPortVisibility = (): void => {
  if (!graph) return;

  graph.on("node:mouseenter", () => {
    const container = graphContainerRef.value;
    if (!container) return;
    const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
    showPorts(ports, true);
  });
  graph.on("node:mouseleave", () => {
    const container = graphContainerRef.value;
    if (!container) return;
    const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
    showPorts(ports, false);
  });
};

/** 初始化 stencil */
const initStencil = (): void => {
  if (!graph || !stencilContainerRef.value) return;

  stencil = new Stencil({
    title: "流程图",
    target: graph,
    stencilGraphWidth: 200,
    stencilGraphHeight: 180,
    stencilGraphOptions: { panning: true },
    collapsable: true,
    groups: [
      { title: "基础流程图", name: "group1" },
      {
        title: "系统设计图",
        name: "group2",
        graphHeight: 250,
        layoutOptions: { rowHeight: 70 }
      }
    ],
    layoutOptions: {
      columns: 2,
      columnWidth: 80,
      rowHeight: 55
    }
  });
  stencilContainerRef.value.appendChild(stencil.container);
};

/** 画布变更时防抖回写 v-model */
const bindDataSync = (): void => {
  if (!graph) return;
  graph.on("cell:added", scheduleEmit);
  graph.on("cell:removed", scheduleEmit);
  graph.on("cell:change:*", scheduleEmit);
};

/** 防抖回写，避免拖动过程频繁触发 */
const scheduleEmit = (): void => {
  if (emitTimer) clearTimeout(emitTimer);
  emitTimer = setTimeout(() => {
    if (!graph) return;
    const data = graph.toJSON() as FlowchartData;
    lastEmittedData = toRaw(data);
    model.value = data;
  }, 200);
};

/**
 * 从外部数据加载到画布（会清空当前内容）。
 * @param data - x6 toJSON 结构数据
 */
const importData = (data: FlowchartData): void => {
  if (!graph) return;
  graph.fromJSON(data);
  scheduleEmit();
};

/** 导出当前画布数据 */
const exportData = (): FlowchartData => {
  if (!graph) return { cells: [] };
  return graph.toJSON() as FlowchartData;
};

/** 清空画布 */
const clearGraph = (): void => {
  if (!graph) return;
  graph.clearCells();
  scheduleEmit();
};

defineExpose({ importData, exportData, clearGraph });

onMounted(() => {
  registerNodes();
  initGraph();
  initStencil();
  loadStencilNodes();
  // 初始数据加载到画布
  if (model.value && model.value.cells.length > 0) {
    graph?.fromJSON(model.value);
  }
});

// 监听外部 v-model 变化，避免回写数据再次触发 fromJSON
watch(model, (newVal) => {
  if (toRaw(newVal) === lastEmittedData) return;
  if (newVal && graph) {
    graph.fromJSON(newVal);
  }
});

onBeforeUnmount(() => {
  if (emitTimer) clearTimeout(emitTimer);
  stencil?.dispose();
  graph?.dispose();
  graph = null;
  stencil = null;
});
</script>

<template>
  <div class="flowchart">
    <!-- 左侧节点模板面板 -->
    <div ref="stencilContainerRef" class="flowchart__stencil"></div>
    <!-- 右侧画布区域 -->
    <div ref="graphContainerRef" class="flowchart__graph"></div>
  </div>
</template>

<style scoped lang="scss">
.flowchart {
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #dfe3e8;

  &__stencil {
    width: 180px;
    height: 100%;
    position: relative;
    border-right: 1px solid #dfe3e8;
    flex-shrink: 0;
  }

  &__graph {
    flex: 1;
    height: 100%;
    min-width: 0;
  }
}
</style>

<style lang="scss">
/* x6 插件样式覆写（非 scoped，作用于全局 x6 控件） */
.x6-widget-stencil {
  background-color: #fff;
}
.x6-widget-stencil-title {
  background-color: #fff;
}
.x6-widget-stencil-group-title {
  background-color: #fff !important;
}
.x6-widget-transform {
  margin: -1px 0 0 -1px;
  padding: 0px;
  border: 1px solid #239edd;
}
.x6-widget-transform > div {
  border: 1px solid #239edd;
}
.x6-widget-transform > div:hover {
  background-color: #3dafe4;
}
.x6-widget-transform-active-handle {
  background-color: #3dafe4;
}
.x6-widget-transform-resize {
  border-radius: 0;
}
.x6-widget-selection-inner {
  border: 1px solid #239edd;
}
.x6-widget-selection-box {
  opacity: 0;
}
</style>
