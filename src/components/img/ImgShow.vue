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
      <button @click="setFreeDrawingMode(true)" :class="{ active: isDrawing }">
        ✏️ 画笔
      </button>
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
import bgImage from "@/assets/123.jpg"; // ✅ Vite 专属语法，获取图片的 URL
import pen from "../../../public/pen.png";
// Refs
const canvasEl = ref(null);
let canvas = null;

const isDrawing = ref(false); // 是否处于自由绘制模式
// 画笔颜色
const brushColor = ref("#ff0000"); // 默认红色

// 画笔粗细
const brushSize = ref(3); // 默认 3px

// 更新画笔颜色
const updateBrushColor = () => {
  if (!canvas || !canvas.freeDrawingBrush) return;
  canvas.freeDrawingBrush.color = brushColor.value;
};

// 更新画笔粗细
const updateBrushSize = () => {
  if (!canvas || !canvas.freeDrawingBrush) return;
  canvas.freeDrawingBrush.width = Number(brushSize.value);
};
// 切换自由绘制模式
const setFreeDrawingMode = (isFreeDrawing) => {
  if (!canvas) return;

  isDrawing.value = isFreeDrawing;

  if (isFreeDrawing) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor.value;
    canvas.freeDrawingBrush.width = Number(brushSize.value);

    console.log("🎨 进入画笔模式，设置自定义光标为 /pen.png"); // ✅ 加这一行

    // canvasEl.value.style.cursor = "url('/pen.png') 0 24, auto";
    canvas.freeDrawingCursor = "url('/pen.png') 2 30, auto";
    //  canvas.renderAll()
  } else {
    canvas.isDrawingMode = false;
    canvasEl.value.style.cursor = "default"; // 恢复默认箭头
  }
};

// 初始化 Fabric Canvas
onMounted(() => {
  canvas = new fabric.Canvas(canvasEl.value, {
    width: 450,
    height: 800,
  });

  // 使用 import 得到的图片 URL！
  fabric.Image.fromURL(
    bgImage,
    (img) => {
      if (!img) {
        console.error("背景图片加载失败，img is null");
        return;
      }

      img.set({
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
        selectable: false,
        evented: false,
      });

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    },
    {
      // 如果图片跨域可加上这一行
      // crossOrigin: 'anonymous',
    }
  );
});
</script>

<style lang="scss" scoped>
.img-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid pink;
  height: 100vh;
  width: 50vw;
  box-sizing: border-box;

  .img-wrapper .norem {
    border: 1px solid red;
    height: 600px;
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
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
