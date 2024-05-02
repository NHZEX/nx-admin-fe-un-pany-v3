<script setup lang="tsx">
import { ref, onMounted } from "vue"
import { SystemApi } from "@/api/admin/system"

const loading = ref<{
  system: boolean
}>({
  system: false
})
const infoItems = ref([])

async function handleRefresh() {
  loading.value.system = true
  try {
    const { data } = await SystemApi.systemInfo()
    infoItems.value = data
  } finally {
    loading.value.system = false
  }
}

onMounted(async () => await handleRefresh())

defineExpose({
  reload: handleRefresh
})
</script>

<template>
  <el-table
    :data="infoItems"
    border
    size="default"
    v-loading="loading.system"
    style="min-width: 400px; max-width: 600px"
  >
    <el-table-column label="系统信息">
      <el-table-column prop="name" label="名称" width="120"> </el-table-column>
      <el-table-column prop="value" label="值">
        <template #default="{ row }">
          <ul v-if="Array.isArray(row.value)">
            <li v-for="(item, i) of row.value" :key="i">
              <label class="font-semibold">{{ item.label }}: </label>
              <span>{{ item.value }}</span>
            </li>
          </ul>
          <span v-else>{{ row.value }}</span>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
