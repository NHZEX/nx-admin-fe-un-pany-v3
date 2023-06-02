<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"
import AdminDashboard from "./admin/index.vue"
import EditorDashboard from "./editor/index.vue"

const userStore = useUserStore()
</script>

<template>
  <component :is="userStore.isAnyAdmin ? AdminDashboard : EditorDashboard" />
</template>
