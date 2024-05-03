<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user"

const userStore = useUserStore()
</script>

<template>
  <div class="p-4">
    <h1>Welcome {{ userStore.username }} !</h1>
  </div>
</template>
