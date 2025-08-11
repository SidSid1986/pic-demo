<!--
 * @Author: Sid Li
 * @Date: 2025-08-07 08:52:11
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-11 08:59:28
 * @FilePath: \pic-demo-git\pic-demo\src\views\Home\home.vue
 * @Description: 
-->
<template>
  <div class="container">
    <div><Flow /></div>
    <div><ImgShow /></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import Flow from "@/components/flow/Flow.vue";
import ImgShow from "@/components/img/ImgShow.vue";
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
