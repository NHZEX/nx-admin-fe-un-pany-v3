<script setup lang="tsx">
import { ref, onMounted } from "vue"
import { SystemApi, type TableInfo, DatabaseItem } from "@/api/admin/system"
import { VxeTablePropTypes } from "vxe-table/types/table"

const loading = ref<boolean>(false)
const database = ref<DatabaseItem[]>([])

type RowVO = TableInfo

async function handleRefresh() {
  loading.value = true
  try {
    const { data } = await SystemApi.database()
    database.value = data
  } finally {
    loading.value = false
  }
}

const sortConfig = ref<VxeTablePropTypes.SortConfig<RowVO>>({
  remote: false,
  sortMethod({ data, sortList }) {
    const sortItem = sortList[0]

    const humanMap = {
      avg_row_size: "avg_row_length",
      data_size: "data_length",
      index_size: "index_length",
      data_free_size: "data_free",
      total_size: (item: RowVO) => item.data_length + item.index_length
    }

    type humanFieldType = keyof typeof humanMap

    const property: keyof RowVO | string = sortItem.field
    let sortProperty: string | Function
    let humanField: humanFieldType

    if (
      property.startsWith("human.") &&
      (humanField = property.split(".")[1] as humanFieldType) &&
      Object.prototype.hasOwnProperty.call(humanMap, humanField)
    ) {
      sortProperty = humanMap[humanField]
    } else {
      sortProperty = property
    }

    data.sort((a, b) => {
      let aVal
      let bVal

      if (typeof sortProperty === "function") {
        aVal = sortProperty(a)
        bVal = sortProperty(b)
      } else {
        aVal = a[sortProperty as keyof RowVO]
        bVal = b[sortProperty as keyof RowVO]
      }

      if (sortItem.order === "desc") {
        return aVal < bVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })

    return data
  }
})

onMounted(async () => await handleRefresh())

defineExpose({
  reload: handleRefresh
})
</script>

<template>
  <el-card
    v-loading="loading"
    v-for="item of database"
    :key="item.name"
    style="max-width: 1100px"
    :body-style="{ padding: '6px' }"
  >
    <template v-slot:header>
      <span class="font-bold text-xl"># {{ item.name }} ({{ item.version }})</span>
    </template>
    <div style="width: 100%">
      <vxe-table
        :data="item.tables"
        border
        size="small"
        max-height="900"
        :empty-text="item.message || '暂无数据'"
        :sort-config="sortConfig"
      >
        <vxe-column type="seq" title="#" fixed="left" width="50"></vxe-column>
        <vxe-column field="table_name" title="表名" fixed="left" width="180" sortable></vxe-column>
        <vxe-column field="table_rows" title="行数" fixed="left" width="90" sortable></vxe-column>
        <vxe-column field="human.total_size" title="表尺寸" width="100" sortable></vxe-column>
        <vxe-column field="human.data_size" title="数据大小" width="100" sortable></vxe-column>
        <vxe-column field="human.index_size" title="索引大小" width="100" sortable></vxe-column>
        <vxe-column field="human.data_free_size" title="碎片大小" width="100" sortable></vxe-column>
        <vxe-column field="human.avg_row_size" title="平均行尺寸" width="110" sortable></vxe-column>
        <vxe-column field="update_time" title="更新时间" width="140" sortable></vxe-column>
        <vxe-column field="table_comment" title="表注释" width="140"></vxe-column>
      </vxe-table>
    </div>
  </el-card>
</template>

<style scoped lang="scss"></style>
