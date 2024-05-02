<script setup lang="tsx">
import { onMounted } from "vue"
import SystemEnvironmentInfo from "@/views/system/components/SystemEnvironmentInfo.vue"
import SystemDatabaseInfo from "@/views/system/components/SystemDatabaseInfo.vue"

onMounted(async () => {})
</script>

<template>
  <div class="app-container">
    <div style="padding: 10px 0 10px" class="flex flex-row space-x-2">
      <SystemEnvironmentInfo />
      <SystemDatabaseInfo />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
