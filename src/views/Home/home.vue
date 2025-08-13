<!--
 * @Author: Sid Li
 * @Date: 2025-08-07 08:52:11
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-12 14:13:32
 * @FilePath: \pic-demo-git\pic-demo\src\views\Home\home.vue
 * @Description: 
-->
<template>
  <div class="container">
    <div><Flow :stepsData="stepsData" /></div>
    <div><ImgShow /></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import Flow from "@/components/flow/Flow.vue";
import ImgShow from "@/components/img/ImgShow.vue";

import { steps } from "@/api/common.js";

const stepsData = ref([]);
const getSteps = () => {
  steps().then((res) => {
    console.log(res);
    stepsData.value = res;
    console.log(stepsData.value);
  });
};

onMounted(() => {
  getSteps();
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
}
</style>
