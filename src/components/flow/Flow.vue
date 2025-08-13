<template>
  <div class="flow-container">
    <!-- 节点库 -->
    <div class="flow-menu">
      <button @click="exportFlowJSON" style="margin: 12px">导出流程JSON</button>
      <button @click="deleteSelectedEdge">删除选中连线</button>
      <button @click="deleteSelectedNode">删除选中节点</button>
      <button @click="startFlowAnimation" style="margin-top: 12px">
        开始流程动画
      </button>
      <h3>节点库</h3>
      <div class="node-templates-container">
        <div
          v-for="(item, idx) in nodeTemplates"
          :key="idx"
          class="node-template"
          draggable="true"
          @dragstart="(e) => onDragStart(e, item, idx)"
        >
          {{ item.data.label }}
        </div>
      </div>
    </div>
    <!-- 画布区 -->
    <div class="flow-content">
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
        :node-types="nodeTypes"
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

        <Background
          :size="1.6"
          pattern-color="	rgba(255,192,203,1.000)"
          bgColor="rgba(238,238,238,0.5)"
          :gap="16"
        />
        <MiniMap />
        <Controls
          :showFitView="false"
          :showInteractive="false"
          position="top-left"
        >
          <!-- <ControlButton title="Reset Transform" @click="resetTransform">
            <Icon name="reset" />
          </ControlButton>
          <ControlButton title="Shuffle Node Positions" @click="updatePos">
            <Icon name="update" />
          </ControlButton> -->
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
import { ref, markRaw, watch } from "vue";
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { ControlButton, Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import Icon from "./Icon.vue";
import AnimatedEdge from "./AnimatedEdge.vue"; // 导入自定义动画边组件
import CustomNode from "./CustomNode.vue"; // ← 根据你的路径调整
import "@/styles/main.css";
import "@vue-flow/core/dist/style.css";

import { processImage } from "@/api/common";

const nodes = ref([]);
const edges = ref([]);
const selectedNodes = ref([]);
const selectedEdges = ref([]);
const { onInit, addEdges, project, setViewport, toObject, updateEdgeData } =
  useVueFlow();
// ✅ 注册自定义节点类型
const nodeTypes = {
  custom: markRaw(CustomNode), // 关键在这里！ // 'custom' 是你在节点数据里用的 type 名称，必须匹配！
};
const dark = ref(false);

// 节点库模板
// const nodeTemplates = [
//   {
//     // type: "input",
//     type: "custom",
//     data: { label: "开始", type: "start" },
//     class: "my-custom-node-class",
//     // style: { backgroundColor: "pink", width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤1", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤2", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤3", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤4", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤5", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤6", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "output",
//     type: "custom",
//     data: { label: "结束", type: "end" },
//     class: "light",
//     // style: { backgroundColor: "pink", width: "60px", height: "40px" },
//   },
// ];

const nodeTemplates = ref([]);

const props = defineProps({
  stepsData: {
    type: Array,
    default: () => [],
  },
});

watch(
  () => props.stepsData,
  (stepsData) => {
    console.log(stepsData);
    // 创建节点
    nodeTemplates.value = stepsData.map((step, idx) => ({
      // id: `node-${step.id}`,
      type: "custom",
      data: { stepId: step.id, label: step.name, type: "step" },
    }));
  }
);

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

//第一种格式
// function exportFlowJSON() {
//   // 构建 id 到 label 的映射
//   const nodeMap = {};
//   nodes.value.forEach((node) => {
//     nodeMap[node.id] = node.data.label;
//   });

//   // 构建 source 到 target 数组的映射
//   const nextMap = {};
//   edges.value.forEach((edge) => {
//     const { source, target } = edge;
//     if (!nextMap[source]) {
//       nextMap[source] = [];
//     }
//     nextMap[source].push(target);
//   });

//   // 找到起始节点（没有前驱节点的节点）
//   const startNodes = nodes.value.filter(
//     (node) => !edges.value.some((edge) => edge.target === node.id)
//   );
//   if (startNodes.length === 0) {
//     alert("没有找到开始节点！");
//     return;
//   }

//   // 找到结束节点（没有后继节点的节点）
//   const endNodes = nodes.value.filter(
//     (node) => !nextMap[node.id]?.length || nextMap[node.id].length === 0
//   );
//   if (endNodes.length === 0) {
//     alert("没有找到结束节点！");
//     return;
//   }

//   // 检测流程类型：是否有多个起始路径（并行流程）
//   const isParallel = startNodes.some(
//     (startNode) => nextMap[startNode.id]?.length > 1
//   );

//   if (!isParallel) {
//     // ↓↓↓ 线性流程 ↓↓↓ （保持您原来的正确代码不变）
//     const result = [];
//     let currentId = startNodes[0].id;
//     while (currentId) {
//       result.push({ id: currentId, label: nodeMap[currentId] });
//       currentId = nextMap[currentId]?.[0]; // 线性流程只取第一个后继节点
//     }

//     console.log(JSON.stringify(result, null, 2));
//     return result;
//   } else {
//     // ↓↓↓ 并行流程 ↓↓↓ （修改了单个嵌套步骤的处理逻辑）

//     // 找出所有直接从开始节点并行的步骤
//     const directParallelSteps = nextMap[startNodes[0].id] || [];

//     // 构建结果结构
//     const result = {
//       start: {
//         id: startNodes[0].id,
//         label: nodeMap[startNodes[0].id],
//       },
//       steps: [],
//       end: {
//         id: endNodes[0].id,
//         label: nodeMap[endNodes[0].id],
//       },
//     };

//     // 收集所有并行步骤（步骤1、步骤2等同级步骤）
//     const parallelSteps = [];

//     // 先处理直接并行步骤
//     directParallelSteps.forEach((stepId) => {
//       // 检查此步骤是否有嵌套步骤（步骤1是否有步骤3和步骤4）
//       const nestedSteps = nextMap[stepId] || [];

//       if (nestedSteps.length > 1) {
//         // 此步骤有并行嵌套步骤（如步骤1有步骤3和步骤4）
//         parallelSteps.push({
//           id: stepId,
//           label: nodeMap[stepId],
//           steps: nestedSteps
//             .map((nestedId) => ({
//               id: nestedId,
//               label: nodeMap[nestedId],
//             }))
//             .filter((nestedStep) => {
//               // 过滤掉结束节点（不应该出现在嵌套steps中）
//               return !endNodes.some((endNode) => endNode.id === nestedStep.id);
//             }),
//         });
//       } else if (nestedSteps.length === 1) {
//         // 此步骤有单个嵌套步骤（如步骤1有步骤3）
//         // 修复：即使只有一个嵌套步骤，也要包含它
//         parallelSteps.push({
//           id: stepId,
//           label: nodeMap[stepId],
//           steps: [
//             {
//               id: nestedSteps[0],
//               label: nodeMap[nestedSteps[0]],
//             },
//           ].filter((nestedStep) => {
//             // 过滤掉结束节点
//             return !endNodes.some((endNode) => endNode.id === nestedStep.id);
//           }),
//         });
//       } else {
//         // 没有嵌套步骤，作为普通并行步骤处理
//         parallelSteps.push({ id: stepId, label: nodeMap[stepId] });
//       }
//     });

//     // 处理其他可能的并行步骤（如步骤2）
//     const otherParallelSteps =
//       nextMap[startNodes[0].id]?.filter((stepId) => {
//         // 排除已经处理的直接并行步骤
//         return !directParallelSteps.includes(stepId);
//       }) || [];

//     otherParallelSteps.forEach((stepId) => {
//       parallelSteps.push({ id: stepId, label: nodeMap[stepId] });
//     });

//     // 过滤掉结束节点（不应该出现在steps中）
//     result.steps = parallelSteps.filter((step) => {
//       return !endNodes.some((endNode) => endNode.id === step.id);
//     });

//     // 特殊处理：如果步骤1有嵌套步骤3和4，确保它们被正确包含
//     const finalSteps = [];
//     result.steps.forEach((step) => {
//       if (step.id === directParallelSteps[0]) {
//         // 假设步骤1是第一个并行步骤
//         const stepNext = nextMap[step.id] || [];
//         if (stepNext.length > 1) {
//           // 步骤1有并行子步骤（步骤3和4）
//           finalSteps.push({
//             id: step.id,
//             label: nodeMap[step.id],
//             steps: stepNext
//               .map((nestedId) => ({
//                 id: nestedId,
//                 label: nodeMap[nestedId],
//               }))
//               .filter((nestedStep) => {
//                 // 只包含步骤3和4，不包含结束节点
//                 return !endNodes.some(
//                   (endNode) => endNode.id === nestedStep.id
//                 );
//               }),
//           });
//         } else if (stepNext.length === 1) {
//           // 步骤1有单个嵌套步骤（步骤3）
//           finalSteps.push({
//             id: step.id,
//             label: nodeMap[step.id],
//             steps: [
//               {
//                 id: stepNext[0],
//                 label: nodeMap[stepNext[0]],
//               },
//             ].filter((nestedStep) => {
//               // 过滤掉结束节点
//               return !endNodes.some((endNode) => endNode.id === nestedStep.id);
//             }),
//           });
//         } else {
//           finalSteps.push(step);
//         }
//       } else {
//         finalSteps.push(step);
//       }
//     });

//     result.steps = finalSteps;

//     console.log(JSON.stringify(result, null, 2));
//     return result;
//   }
// }

//第二种格式
// function exportFlowJSON() {
//   // 1. 收集所有节点和边
//   const allNodes = nodes.value;
//   const allEdges = edges.value;

//   // 2. 正确识别start和end节点
//   const startNode = allNodes.find(
//     (node) => !allEdges.some((edge) => edge.target === node.id)
//   );

//   const endNode = allNodes.find(
//     (node) => !allEdges.some((edge) => edge.source === node.id)
//   );

//   if (!startNode || !endNode) {
//     alert("请先创建完整的流程，包含开始和结束节点");
//     return;
//   }

//   // 3. 构建邻接表（源节点→目标节点列表）
//   const adjacencyList = {};
//   allEdges.forEach((edge) => {
//     if (!adjacencyList[edge.source]) {
//       adjacencyList[edge.source] = [];
//     }
//     adjacencyList[edge.source].push(edge.target);
//   });

//   // 4. 使用BFS找出所有从start到end的路径
//   const paths = [];
//   const queue = [[startNode.id]];

//   while (queue.length > 0) {
//     const currentPath = queue.shift();
//     const lastNodeId = currentPath[currentPath.length - 1];

//     // 如果到达end节点，保存路径（去掉start和end节点）
//     if (lastNodeId === endNode.id) {
//       const stepNodes = currentPath
//         .slice(1, -1) // 去掉start和end节点
//         .map((id) => ({
//           id,
//           label: allNodes.find((n) => n.id === id)?.data?.label || "",
//         }));

//       if (stepNodes.length > 0) {
//         paths.push(stepNodes);
//       }
//       continue;
//     }

//     // 获取当前节点的所有子节点
//     const children = adjacencyList[lastNodeId] || [];

//     // 为每个子节点创建新路径
//     children.forEach((childId) => {
//       if (!currentPath.includes(childId)) {
//         // 避免循环
//         queue.push([...currentPath, childId]);
//       }
//     });
//   }

//   // 5. 组装结果（确保steps不为空）
//   const result = {
//     start: {
//       id: startNode.id,
//       label: startNode.data.label,
//     },
//     steps: paths.length > 0 ? paths : [[]],
//     end: {
//       id: endNode.id,
//       label: endNode.data.label,
//     },
//   };

//   console.log(JSON.stringify(result, null, 2));
//   return result;
// }

//第三种格式
function exportFlowJSON() {
  // 1. 收集所有节点和边
  const allNodes = nodes.value;
  const allEdges = edges.value;

  // 2. 正确识别start和end节点
  const startNode = allNodes.find(
    (node) => !allEdges.some((edge) => edge.target === node.id)
  );

  const endNode = allNodes.find(
    (node) => !allEdges.some((edge) => edge.source === node.id)
  );

  if (!startNode || !endNode) {
    alert("请先创建完整的流程，包含开始和结束节点");
    return;
  }

  // 3. 构建邻接表（源节点→目标节点列表）
  const adjacencyList = {};
  allEdges.forEach((edge) => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = [];
    }
    adjacencyList[edge.source].push(edge.target);
  });

  // 4. 使用BFS找出所有从start到end的完整路径
  const steps = []; // 直接使用steps数组
  const queue = [[startNode.id]];

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const lastNodeId = currentPath[currentPath.length - 1];

    // 如果到达end节点，保存完整路径
    if (lastNodeId === endNode.id) {
      const fullPath = currentPath.map((id) => ({
        id,
        label: allNodes.find((n) => n.id === id)?.data?.label || "",
        stepId: allNodes.find((n) => n.id === id)?.data?.stepId || "",
      }));
      steps.push(fullPath);
      continue;
    }

    // 获取当前节点的所有子节点
    const children = adjacencyList[lastNodeId] || [];

    // 为每个子节点创建新路径
    children.forEach((childId) => {
      if (!currentPath.includes(childId)) {
        // 避免循环
        queue.push([...currentPath, childId]);
      }
    });
  }

  // 5. 只返回steps数组
  console.log("导出的步骤数据:", JSON.stringify(steps, null, 2));

  const result = steps[0].map((item) => ({
    name: item.label, // label → name
    id: item.stepId, // stepId → id （已经是数字类型）
  }));

  console.log(result);

  let data = [{ id: 3, name: "二值化" }];
  processImage(data).then((res) => {
    console.log(res);
  });

  return steps;
}

// function onNodeClick(params) {
//   console.log(params);
//   selectedNodes.value = [params.node.id];

// }

// 点击节点时触发
const onNodeClick = (event) => {
  const nodeId = event.node.id;
  selectedNodes.value = [event.node.id];
  // 遍历所有节点，对每一个节点都重新设置 data.isSelected
  nodes.value = nodes.value.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isSelected: node.id === nodeId, // ✅ 当前节点为 true，其它节点为 false
    },
  }));
};
// function onEdgeClick(params) {
//   console.log(params);
//   selectedEdges.value = [params.edge.id];
// }

const onEdgeClick = (event) => {
  console.log(event.edge);
  const edgeId = event.edge.id;
  selectedEdges.value = [event.edge.id];

  // 更新 edges，设置被点击的边的 data.isSelected 或 data.color
  edges.value = edges.value.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isSelected: edge.id === edgeId, // 标记是否被点击
      // 或者直接设置颜色
      // color: edge.id === edgeId ? '#ff0000' : undefined,
    },
  }));
};
</script>

<style scoped>
.flow-container {
  display: flex;
  height: 100vh;
  width: 50vw;
  box-sizing: border-box;
}

.flow-menu {
  width: 10vw;
  /* padding: 16px; */
  background: #f5f5f7;
  border: 1px solid pink;
}

.flow-content {
  height: 100vh;
  width: 40vw;
  border: 1px solid pink;
  box-sizing: border-box;
}

.node-templates-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* border: 1px solid red; */
}
.node-template {
  margin-bottom: 4px;
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  cursor: grab;
  width: 50px;
  height: 30px;
  border-radius: 8px;
  /* line-height: 40px; */
  white-space: normal;
  word-break: break-all;
  word-wrap: break-word;
}

.node-template:hover {
  background: #e3eafa;
}
</style>
