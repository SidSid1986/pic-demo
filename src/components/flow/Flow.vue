<template>
  <div style="display: flex; height: 100vh">
    <!-- 节点库 -->
    <div style="width: 180px; padding: 16px; background: #f5f5f7">
      <button @click="exportFlowJSON" style="margin: 12px">导出流程JSON</button>
      <button @click="deleteSelectedEdge">删除选中连线</button>
      <button @click="deleteSelectedNode">删除选中节点</button>
      <button @click="startFlowAnimation" style="margin-top: 12px">
        开始流程动画
      </button>
      <h3>节点库</h3>
      <div
        v-for="(item, idx) in nodeTemplates"
        :key="idx"
        class="node-template"
        draggable="true"
        @dragstart="(e) => onDragStart(e, item, idx)"
        style="
          margin-bottom: 8px;
          padding: 8px;
          background: #fff;
          border: 1px solid #ddd;
          cursor: grab;
        "
      >
        {{ item.data.label }}
      </div>
    </div>
    <!-- 画布区 -->
    <div style="flex: 1; height: 100vh">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        v-model:selected-nodes="selectedNodes"
        v-model:selected-edges="selectedEdges"
        :selectable="true"
        :nodes-draggable="true"
        :elements-selectable="true"
        :class="{ dark }"
        class="basic-flow"
        :default-viewport="{ zoom: 1.5 }"
        :min-zoom="0.2"
        :max-zoom="4"
        @drop="onDrop"
        @dragover="onDragOver"
        @connect="onConnect"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
      >
        <!-- 注册自定义边 -->
        <template #edge-animated="edgeProps">
          <AnimatedEdge
            :id="edgeProps.id"
            :source="edgeProps.source"
            :target="edgeProps.target"
            :source-x="edgeProps.sourceX"
            :source-y="edgeProps.sourceY"
            :targetX="edgeProps.targetX"
            :targetY="edgeProps.targetY"
            :source-position="edgeProps.sourcePosition"
            :target-position="edgeProps.targetPosition"
            :data="edgeProps.data"
          />
        </template>

        <Background pattern-color="#aaa" :gap="16" />
        <MiniMap />
        <Controls position="top-left">
          <ControlButton title="Reset Transform" @click="resetTransform">
            <Icon name="reset" />
          </ControlButton>
          <ControlButton title="Shuffle Node Positions" @click="updatePos">
            <Icon name="update" />
          </ControlButton>
          <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
            <Icon v-if="dark" name="sun" />
            <Icon v-else name="moon" />
          </ControlButton>
          <ControlButton title="Log `toObject`" @click="logToObject">
            <Icon name="log" />
          </ControlButton>
        </Controls>
      </VueFlow>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { ControlButton, Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import Icon from "./Icon.vue";
import AnimatedEdge from "./AnimatedEdge.vue"; // 导入自定义动画边组件
import "@/styles/main.css";
import "@vue-flow/core/dist/style.css";

// 节点库模板
const nodeTemplates = [
  {
    type: "input",
    data: { label: "开始" },
    class: "my-custom-node-class",
    style: { backgroundColor: "red", width: "100px", height: "50px" },
  },
  { type: "default", data: { label: "步骤1" }, class: "light" },
  { type: "default", data: { label: "步骤2" }, class: "light" },
  { type: "default", data: { label: "步骤3" }, class: "light" },
  { type: "default", data: { label: "步骤4" }, class: "light" },
  { type: "output", data: { label: "结束" }, class: "light" },
];

const nodes = ref([]);
const edges = ref([]);
const selectedNodes = ref([]);
const selectedEdges = ref([]);
const { onInit, addEdges, project, setViewport, toObject, updateEdgeData } =
  useVueFlow();
const dark = ref(false);

// 拖拽开始时，记录拖拽的节点类型
function onDragStart(event, template, idx) {
  event.dataTransfer.setData(
    "application/vueflow",
    JSON.stringify({ ...template, idx })
  );
  event.dataTransfer.effectAllowed = "move";
}

// 拖拽放置
function onDrop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("application/vueflow");
  if (!data) return;
  const template = JSON.parse(data);

  // 计算节点位置
  const rect = event.currentTarget.getBoundingClientRect();
  const position = project({
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  });

  const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  nodes.value.push({
    ...template,
    id,
    position,
  });
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

// 创建连线时使用我们的自定义动画边;
function onConnect(connection) {
  // 生成唯一ID
  const edgeId = `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  addEdges({
    ...connection,
    id: edgeId,
    type: "animated",
    animated: true, // 这是我们的自定义边组件类型标识
    // markerEnd: {
    //   type: MarkerType.ArrowClosed, // 保持箭头
    //   width: 20,
    //   height: 20,
    //   color: "#6b7280",
    // },
    data: {
      startAnimation: false,
      onAnimationStart: (value) => {
        // 更新边数据，重置动画触发状态
        updateEdgeData(edgeId, { startAnimation: value });
      },
    },
  });
}

// 开始流程动画
function startFlowAnimation() {
  // 构建节点连接关系
  const edgeMap = {};
  edges.value.forEach((edge) => {
    edgeMap[edge.source] = edge.id;
  });

  // 找到起始节点
  const allTargets = edges.value.map((e) => e.target);
  const startNode = nodes.value.find((n) => !allTargets.includes(n.id));

  if (!startNode) {
    alert("请先创建完整的流程，包含开始和结束节点");
    return;
  }

  // 按顺序触发每条边的动画
  let currentNodeId = startNode.id;
  const animateNextEdge = () => {
    const edgeId = edgeMap[currentNodeId];
    if (!edgeId) return;

    // 触发当前边的动画
    updateEdgeData(edgeId, { startAnimation: true });

    // 找到下一个节点
    const nextEdge = edges.value.find((e) => e.id === edgeId);
    if (nextEdge) {
      currentNodeId = nextEdge.target;
      // 等待当前动画完成后再开始下一个
      setTimeout(animateNextEdge, 1500);
    }
  };

  // 开始动画序列
  animateNextEdge();
}

// 其他原有方法保持不变...
function deleteSelectedNode() {
  const selectedIds = selectedNodes.value.map((n) =>
    typeof n === "string" ? n : n.id
  );
  nodes.value = nodes.value.filter((node) => !selectedIds.includes(node.id));
  edges.value = edges.value.filter(
    (edge) =>
      !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)
  );
  selectedNodes.value = [];
}

function deleteSelectedEdge() {
  const selectedIds = selectedEdges.value.map((e) =>
    typeof e === "string" ? e : e.id
  );
  edges.value = edges.value.filter((edge) => !selectedIds.includes(edge.id));
  selectedEdges.value = [];
}

onInit((vueFlowInstance) => {
  vueFlowInstance.fitView();
});

function updatePos() {
  nodes.value = nodes.value.map((node) => ({
    ...node,
    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },
  }));
}

function logToObject() {
  console.log(toObject());
}

function resetTransform() {
  setViewport({ x: 0, y: 0, zoom: 1 });
}

function toggleDarkMode() {
  dark.value = !dark.value;
}

function exportFlowJSON() {
  // 构建 id 到 label 的映射
  const nodeMap = {};
  nodes.value.forEach((node) => {
    nodeMap[node.id] = node.data.label;
  });

  // 构建 source 到 target 数组的映射
  const nextMap = {};
  edges.value.forEach((edge) => {
    const { source, target } = edge;
    if (!nextMap[source]) {
      nextMap[source] = [];
    }
    nextMap[source].push(target);
  });

  // 找到起始节点（没有前驱节点的节点）
  const startNodes = nodes.value.filter(
    (node) => !edges.value.some((edge) => edge.target === node.id)
  );
  if (startNodes.length === 0) {
    alert("没有找到开始节点！");
    return;
  }

  // 找到结束节点（没有后继节点的节点）
  const endNodes = nodes.value.filter(
    (node) => !nextMap[node.id]?.length || nextMap[node.id].length === 0
  );
  if (endNodes.length === 0) {
    alert("没有找到结束节点！");
    return;
  }

  // 检测流程类型：是否有多个起始路径（并行流程）
  const isParallel = startNodes.some(
    (startNode) => nextMap[startNode.id]?.length > 1
  );

  if (!isParallel) {
    // ↓↓↓ 线性流程 ↓↓↓ （保持您原来的正确代码不变）
    const result = [];
    let currentId = startNodes[0].id;
    while (currentId) {
      result.push({ id: currentId, label: nodeMap[currentId] });
      currentId = nextMap[currentId]?.[0]; // 线性流程只取第一个后继节点
    }

    console.log(JSON.stringify(result, null, 2));
    return result;
  } else {
    // ↓↓↓ 并行流程 ↓↓↓ （只修改这部分）

    // 找出所有直接从开始节点并行的步骤
    const directParallelSteps = nextMap[startNodes[0].id] || [];

    // 构建结果结构
    const result = {
      start: {
        id: startNodes[0].id,
        label: nodeMap[startNodes[0].id],
      },
      steps: [],
      end: {
        id: endNodes[0].id,
        label: nodeMap[endNodes[0].id],
      },
    };

    // 收集所有并行步骤（步骤1、步骤2等同级步骤）
    const parallelSteps = [];

    // 先处理直接并行步骤
    directParallelSteps.forEach((stepId) => {
      // 检查此步骤是否有嵌套步骤（步骤1是否有步骤3和步骤4）
      const nestedSteps = nextMap[stepId] || [];

      if (nestedSteps.length > 1) {
        // 此步骤有并行嵌套步骤（如步骤1有步骤3和步骤4）
        parallelSteps.push({
          id: stepId,
          label: nodeMap[stepId],
          steps: nestedSteps
            .map((nestedId) => ({
              id: nestedId,
              label: nodeMap[nestedId],
            }))
            .filter((nestedStep) => {
              // 过滤掉结束节点（不应该出现在嵌套steps中）
              return !endNodes.some((endNode) => endNode.id === nestedStep.id);
            }),
        });
      } else if (nestedSteps.length === 1) {
        // 检查嵌套步骤是否还有子步骤
        const nextNestedSteps = nextMap[nestedSteps[0]] || [];
        if (nextNestedSteps.length > 1) {
          // 嵌套步骤有并行子步骤（如步骤3和步骤4）
          parallelSteps.push({
            id: stepId,
            label: nodeMap[stepId],
            steps: nextNestedSteps
              .map((nestedId) => ({
                id: nestedId,
                label: nodeMap[nestedId],
              }))
              .filter((nestedStep) => {
                // 过滤掉结束节点
                return !endNodes.some(
                  (endNode) => endNode.id === nestedStep.id
                );
              }),
          });
        } else {
          // 单个嵌套步骤，无并行子步骤，作为普通步骤处理
          parallelSteps.push({ id: stepId, label: nodeMap[stepId] });
        }
      } else {
        // 没有嵌套步骤，作为普通并行步骤处理
        parallelSteps.push({ id: stepId, label: nodeMap[stepId] });
      }
    });

    // 处理其他可能的并行步骤（如步骤2）
    const otherParallelSteps =
      nextMap[startNodes[0].id]?.filter((stepId) => {
        // 排除已经处理的直接并行步骤
        return !directParallelSteps.includes(stepId);
      }) || [];

    otherParallelSteps.forEach((stepId) => {
      parallelSteps.push({ id: stepId, label: nodeMap[stepId] });
    });

    // 过滤掉结束节点（不应该出现在steps中）
    result.steps = parallelSteps.filter((step) => {
      return !endNodes.some((endNode) => endNode.id === step.id);
    });

    // 特殊处理：如果步骤1有嵌套步骤3和4，确保它们被正确包含
    const finalSteps = [];
    result.steps.forEach((step) => {
      if (step.id === directParallelSteps[0]) {
        // 假设步骤1是第一个并行步骤
        const stepNext = nextMap[step.id] || [];
        if (stepNext.length > 1) {
          // 步骤1有并行子步骤（步骤3和4）
          finalSteps.push({
            id: step.id,
            label: nodeMap[step.id],
            steps: stepNext
              .map((nestedId) => ({
                id: nestedId,
                label: nodeMap[nestedId],
              }))
              .filter((nestedStep) => {
                // 只包含步骤3和4，不包含结束节点
                return !endNodes.some(
                  (endNode) => endNode.id === nestedStep.id
                );
              }),
          });
        } else {
          finalSteps.push(step);
        }
      } else {
        finalSteps.push(step);
      }
    });

    result.steps = finalSteps;

    console.log(JSON.stringify(result, null, 2));
    return result;
  }
}

function onNodeClick(params) {
  selectedNodes.value = [params.node.id];
}

function onEdgeClick(params) {
  selectedEdges.value = [params.edge.id];
}
</script>

<style scoped>
.node-template:hover {
  background: #e3eafa;
}
</style>
