<script setup lang="tsx">
import { ref, onMounted } from "vue"
import { SystemApi, type TableInfo, DatabaseItem } from "@/api/admin/system"
import { VxeTablePropTypes } from "vxe-table/types/table"
import DatabasePartitionTabel from "@/views/system/components/DatabasePartitionTabel.vue"

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

    const sortValMap = {
      "human.avg_row_size": "avg_row_length",
      "human.data_size": "data_length",
      "human.index_size": "index_length",
      "human.data_free_size": "data_free",
      "human.total_size": (item: RowVO) => item.data_length + item.index_length,
      partition: (item: RowVO) => (Array.isArray(item.partition) ? item.partition.length : 0)
    }

    type sortValueFieldName = keyof typeof sortValMap

    const property: keyof RowVO | sortValueFieldName | string = sortItem.field
    let sortProperty: string | Function

    if (Object.prototype.hasOwnProperty.call(sortValMap, property)) {
      sortProperty = sortValMap[property as sortValueFieldName]
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

const expandConfig = ref<VxeTablePropTypes.ExpandConfig<RowVO>>({
  labelField: "table_name",
  visibleMethod({ row }) {
    return row.partition ? row.partition?.length > 0 : false
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
        :data="item.table"
        border
        size="small"
        auto-resize
        max-height="900"
        :empty-text="item.message || '暂无数据'"
        :row-config="{
          useKey: true,
          keyField: 'table_name'
        }"
        :sort-config="sortConfig"
        :expand-config="expandConfig"
      >
        <vxe-column type="seq" title="#" width="50" align="left"></vxe-column>
        <vxe-column type="expand" title="表名" width="180" sortable align="left">
          <template #content="{ row }: { row: RowVO }">
            <DatabasePartitionTabel :partition="row.partition" v-if="null !== row.partition" />
          </template>
        </vxe-column>
        <vxe-column
          field="partition"
          title="分区"
          width="90"
          sortable
          :formatter="({ cellValue }) => (Array.isArray(cellValue) ? cellValue.length : '无')"
        ></vxe-column>
        <vxe-column field="table_rows" title="行数" width="90" sortable></vxe-column>
        <vxe-column field="human.total_size" title="表尺寸" width="100" sortable></vxe-column>
        <vxe-column field="human.data_size" title="数据大小" width="100" sortable></vxe-column>
        <vxe-column field="human.index_size" title="索引大小" width="100" sortable></vxe-column>
        <vxe-column field="human.data_free_size" title="碎片大小" width="100" sortable></vxe-column>
        <vxe-column field="human.avg_row_size" title="平均行尺寸" width="110" sortable></vxe-column>
        <vxe-column field="table_collation" title="字符集" width="140" sortable></vxe-column>
        <vxe-column field="create_time" title="创建时间" width="140" sortable></vxe-column>
        <vxe-column field="update_time" title="更新时间" width="140" sortable></vxe-column>
        <vxe-column field="table_comment" title="表注释" width="140"></vxe-column>
      </vxe-table>
    </div>
  </el-card>
</template>

<style scoped lang="scss"></style>
