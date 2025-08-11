<template>
  <div class="img-container">
    <div class="img-wrapper">
      <canvas
        ref="canvasEl"
        id="fabric-canvas"
        width="450"
        height="800"
      ></canvas>
      <!-- <img class="img-content" src="@/assets/123.jpg" alt="" /> -->
    </div>

    <div class="toolbar">
      <button @click="addRectangle" class="rectangle-btn">🔲 添加矩形</button>
      <button @click="setFreeDrawingMode" :class="{ active: isDrawing }">
        ✏️ 画笔
      </button>
      <button @click="addCircle" class="circle-btn">⭕ 画圆</button>
      <button @click="addEllipse" class="ellipse-btn">🥚 画椭圆</button>
      <button
        @click="setArrowDragMode(true)"
        :class="{ active: isArrowDragMode }"
      >
        🎯 拖拽实时箭头
      </button>

      <button @click="addTriangle" class="triangle-btn">🔺 添加三角形</button>
      <button @click="addText" class="text-btn">📝 添加文本</button>
      <button @click="exportImage" class="export-btn">📥 导出图片</button>
      <button
        @click="setFreeDrawingMode(false)"
        :class="{ active: !isDrawing }"
      >
        👆 选择
      </button>

      <!-- 🎨 颜色选择器 -->
      <input
        type="color"
        v-model="brushColor"
        @input="updateBrushColor"
        title="选择画笔颜色"
      />

      <!-- 📏 画笔粗细 -->
      <label>粗细: {{ brushSize }}px</label>
      <input
        type="range"
        min="1"
        max="20"
        v-model="brushSize"
        @input="updateBrushSize"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fabric } from "fabric";
import bgImage from "@/assets/123.jpg";
import pen from "@/assets/pen.png";

// Refs
const canvasEl = ref(null);
let canvas = null;

// 画笔状态
const isDrawing = ref(false);
const brushColor = ref("#ff0000");
const brushSize = ref(3);
const isArrowDragMode = ref(false);
const arrowDragStartPoint = ref(null);

// 预览相关
let previewGroup = null;
let previewLine = null;
let previewArrowHead = null;

// 更新画笔颜色
const updateBrushColor = () => {
  if (!canvas?.freeDrawingBrush) return;
  canvas.freeDrawingBrush.color = brushColor.value;
};

// 更新画笔粗细
const updateBrushSize = () => {
  if (!canvas?.freeDrawingBrush) return;
  canvas.freeDrawingBrush.width = Number(brushSize.value);
};

// 设置自由绘制模式
const setFreeDrawingMode = () => {
  if (!canvas) return;

  isDrawing.value = !isDrawing.value; // 反转当前状态

  if (isDrawing.value) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor.value;
    canvas.freeDrawingBrush.width = Number(brushSize.value);
    canvas.freeDrawingCursor = `url(${pen}) 2 30, auto`;
  } else {
    canvas.isDrawingMode = false;
    canvas.freeDrawingBrush = null; // 可选：清理画笔
    canvas.defaultCursor = "default";
  }
};

// 添加基础图形
const addRectangle = () =>
  addShape(
    () =>
      new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 80,
        fill: "rgba(0, 123, 255, 0.3)",
        stroke: "#007bff",
        strokeWidth: 2,
      })
  );
const addCircle = () =>
  addShape(
    () =>
      new fabric.Circle({
        left: 100,
        top: 100,
        radius: 40,
        fill: "rgba(255, 193, 7, 0.4)",
        stroke: "#ffc107",
        strokeWidth: 2,
      })
  );
const addEllipse = () =>
  addShape(
    () =>
      new fabric.Ellipse({
        left: 100,
        top: 200,
        rx: 60,
        ry: 40,
        fill: "rgba(40, 167, 69, 0.4)",
        stroke: "#28a745",
        strokeWidth: 2,
      })
  );
const addTriangle = () =>
  addShape(
    () =>
      new fabric.Polygon(
        [
          { x: 100, y: 450 },
          { x: 50, y: 520 },
          { x: 150, y: 520 },
        ],
        { fill: "rgba(220, 53, 69, 0.4)", stroke: "#dc3545", strokeWidth: 2 }
      )
  );
const addText = () =>
  addShape(
    () =>
      new fabric.Text("双击编辑文字", {
        left: 100,
        top: 300,
        fontSize: 20,
        fill: "#333",
        fontFamily: "Arial",
        editable: true,
      })
  );

const addShape = (factory) => {
  if (!canvas) return;
  const shape = factory();
  canvas.add(shape);
  canvas.setActiveObject(shape);
};

// 导出图片
const exportImage = () => {
  if (!canvas) return;
  const dataURL = canvas.toDataURL({ format: "png", quality: 1.0 });
  const link = document.createElement("a");
  link.download = `canvas-image-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
};

// 箭头相关
const setArrowDragMode = (isDragging) => {
  isArrowDragMode.value = isDragging;
  if (isDragging) {
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
    canvas.selection = false;
    clearPreviewArrow();
  } else {
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "default";
    canvas.selection = true;
    clearPreviewArrow();
  }
};

// 鼠标事件处理
const handleArrowDragMouseDown = (opt) => {
  if (!isArrowDragMode.value) return;
  const pointer = canvas.getPointer(opt.e);
  arrowDragStartPoint.value = { x: pointer.x, y: pointer.y };
  clearPreviewArrow();
};

const handleArrowDragMouseMove = (opt) => {
  if (!isArrowDragMode.value || !arrowDragStartPoint.value) return;
  const pointer = canvas.getPointer(opt.e);
  const start = arrowDragStartPoint.value;
  const end = { x: pointer.x, y: pointer.y };
  clearPreviewArrow();
  const { line, arrowHead } = createPreviewArrow(
    start.x,
    start.y,
    end.x,
    end.y
  );
  previewLine = line;
  previewArrowHead = arrowHead;
  canvas.add(line, arrowHead);
  canvas.renderAll();
};

const handleArrowDragMouseUp = (opt) => {
  if (!isArrowDragMode.value || !arrowDragStartPoint.value) return;
  const pointer = canvas.getPointer(opt.e);
  const start = arrowDragStartPoint.value;
  const end = { x: pointer.x, y: pointer.y };
  clearPreviewArrow();
  const arrowGroup = drawArrow(start.x, start.y, end.x, end.y);
  if (arrowGroup) canvas.add(arrowGroup);
  arrowDragStartPoint.value = null;
  setArrowDragMode(false);
};

// 创建预览箭头（不加入正式图形）
const createPreviewArrow = (startX, startY, endX, endY) => {
  const line = new fabric.Line([startX, startY, endX, endY], {
    stroke: brushColor.value,
    strokeWidth: brushSize.value,
    selectable: false,
    evented: false,
  });

  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowHeadLength = 15;
  const headX = endX;
  const headY = endY;
  const leftX = headX - arrowHeadLength * Math.cos(angle - Math.PI / 6);
  const leftY = headY - arrowHeadLength * Math.sin(angle - Math.PI / 6);
  const rightX = headX - arrowHeadLength * Math.cos(angle + Math.PI / 6);
  const rightY = headY - arrowHeadLength * Math.sin(angle + Math.PI / 6);

  const arrowHead = new fabric.Polygon(
    [
      { x: headX, y: headY },
      { x: leftX, y: leftY },
      { x: rightX, y: rightY },
    ],
    {
      fill: brushColor.value,
      stroke: brushColor.value,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    }
  );

  return { line, arrowHead };
};

// 清除预览
const clearPreviewArrow = () => {
  if (previewLine) {
    canvas.remove(previewLine);
    previewLine = null;
  }
  if (previewArrowHead) {
    canvas.remove(previewArrowHead);
    previewArrowHead = null;
  }
  canvas.renderAll();
};

// 绘制正式箭头（line + arrowHead，组合为 Group，主线不突出）
const drawArrow = (startX, startY, endX, endY) => {
  if (!canvas) return null;

  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowHeadLength = 15;
  const headX = endX;
  const headY = endY;

  // 箭头主线终点往回缩一点，避免和箭头头部重叠
  const lineEndX = headX - arrowHeadLength * 0.8 * Math.cos(angle);
  const lineEndY = headY - arrowHeadLength * 0.8 * Math.sin(angle);

  const line = new fabric.Line([startX, startY, lineEndX, lineEndY], {
    stroke: brushColor.value,
    strokeWidth: brushSize.value,
    selectable: true,
    evented: true,
  });

  const leftX = headX - arrowHeadLength * Math.cos(angle - Math.PI / 6);
  const leftY = headY - arrowHeadLength * Math.sin(angle - Math.PI / 6);
  const rightX = headX - arrowHeadLength * Math.cos(angle + Math.PI / 6);
  const rightY = headY - arrowHeadLength * Math.sin(angle + Math.PI / 6);

  const arrowHead = new fabric.Polygon(
    [
      { x: headX, y: headY },
      { x: leftX, y: leftY },
      { x: rightX, y: rightY },
    ],
    {
      fill: brushColor.value,
      stroke: brushColor.value,
      strokeWidth: 1,
      selectable: true,
      evented: true,
      originX: "center",
      originY: "center",
    }
  );

  return new fabric.Group([line, arrowHead], {
    selectable: true,
    evented: true,
  });
};

// 初始化画布
onMounted(() => {
  canvas = new fabric.Canvas(canvasEl.value, { width: 450, height: 800 });

  fabric.Image.fromURL(bgImage, (img) => {
    if (!img) return console.error("背景图加载失败");
    img.set({
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height,
      selectable: false,
      evented: false,
    });
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
  });

  canvas.on("mouse:down", handleArrowDragMouseDown);
  canvas.on("mouse:move", handleArrowDragMouseMove);
  canvas.on("mouse:up", handleArrowDragMouseUp);
});
</script>

<style lang="scss" scoped>
.img-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  height: 100vh;
  width: 49vw;

  .img-wrapper {
    display: inline-block; // 或 block
    border: 1px solid pink; // 可视化边界（调试用，可删）
    padding: 0; // 必须为 0
    margin: 0; // 必须为 0
    // overflow: hidden; // 避免滚动干扰
  }

  .img-wrapper .norem {
    height: 800px;
    width: 450px;
  }
  .img-content {
    display: inline-block;
    width: 100%; // 宽度填满父容器
    height: 100%; // 高度按比例自适应
  }
}

.drawing-board {
  text-align: center;
}
.toolbar {
  margin-bottom: 10px;
}
.toolbar button {
  margin: 0 5px;
  padding: 8px 16px;
  cursor: pointer;
}
.toolbar button.active {
  background-color: #007bff;
  color: white;
}
canvas {
  display: block;
  // border: 1px solid red;
}
</style>
