<script setup>
import { ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { ControlButton, Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import Icon from "./Icon.vue";
import "./main.css";
import { MarkerType } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";

// 节点库模板（不带position）
const nodeTemplates = [
  { type: "input", data: { label: "开始" }, class: "light" },
  { type: "default", data: { label: "步骤1" }, class: "light" },
  { type: "default", data: { label: "步骤2" }, class: "light" },
  { type: "output", data: { label: "结束" }, class: "light" },
];

const nodes = ref([]);
const edges = ref([]);
const selectedNodes = ref([]);
const selectedEdges = ref([]);
const {
  onInit,

  addEdges,
  project,
  setViewport,

  toObject,
} = useVueFlow();
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

  // 画布区域 rect（推荐只用 event.currentTarget）
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

// 连线动画和箭头
function onConnect(connection) {
  addEdges({
    ...connection,
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
    type: "smoothstep",
  });
}

function deleteSelectedNode() {
  console.log("selectedNodes:", selectedNodes.value);
  console.log("selectedEdges:", selectedEdges.value);
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

  // 构建 source 到 target 的映射（线性流程只会有一个target）
  const nextMap = {};
  edges.value.forEach((edge) => {
    nextMap[edge.source] = edge.target;
  });

  // 找到起始节点（没有被其他边指向的节点）
  const allTargets = edges.value.map((e) => e.target);
  const startNodes = nodes.value.filter((n) => !allTargets.includes(n.id));
  if (startNodes.length === 0) {
    alert("没有找到开始节点！");
    return;
  }

  // 顺序遍历节点
  const result = [];
  let currentId = startNodes[0].id;
  while (currentId) {
    result.push({ id: currentId, label: nodeMap[currentId] });
    currentId = nextMap[currentId]; // 找下一个节点
  }
  console.log("nodes:", nodes.value);
  console.log("edges:", edges.value);

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function onNodeClick(params) {
  selectedNodes.value = [params.node.id];
  console.log("手动选中节点:", params.node.id);
}
function onEdgeClick(params) {
  selectedEdges.value = [params.edge.id];
  console.log("手动选中连线:", params.edge.id);
}
</script>

<template>
  <div style="display: flex; height: 100vh">
    <!-- 节点库 -->
    <div style="width: 180px; padding: 16px; background: #f5f5f7">
      <button @click="exportFlowJSON" style="margin: 12px">导出流程JSON</button>
      <button @click="deleteSelectedEdge">删除选中连线</button>
      <button @click="deleteSelectedNode">删除选中节点</button>
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

<style>
.node-template:hover {
  background: #e3eafa;
}
</style>
