<script setup lang="tsx">
import { ref } from "vue"
import { PartitionInfo } from "@/api/admin/system"
import { VxeTablePropTypes } from "vxe-table/types/table"

type RowPartitionInfo = PartitionInfo

const props = defineProps<{
  partition: PartitionInfo[]
}>()

const partitionSortConfig = ref<VxeTablePropTypes.SortConfig<RowPartitionInfo>>({
  remote: false,
  multiple: false,
  sortMethod({ data, sortList }) {
    const sortItem = sortList[0]

    const sortValMap = {
      "human.avg_row_size": "avg_row_length",
      "human.data_size": "data_length",
      "human.index_size": "index_length",
      "human.data_free_size": "data_free",
      "human.total_size": (item: RowPartitionInfo) => item.data_length + item.index_length
    }

    type sortValueFieldName = keyof typeof sortValMap

    const property: keyof RowPartitionInfo | sortValueFieldName | string = sortItem.field
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
        aVal = a[sortProperty as keyof RowPartitionInfo]
        bVal = b[sortProperty as keyof RowPartitionInfo]
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
</script>

<template>
  <vxe-table
    :data="props.partition || []"
    max-height="350px"
    :row-config="{
      useKey: true,
      keyField: 'id'
    }"
    :sort-config="partitionSortConfig"
  >
    <vxe-column type="seq" title="#" width="50" align="left"></vxe-column>
    <vxe-column title="分区" field="partition_name" width="150" sortable show-overflow="title"></vxe-column>
    <vxe-column field="table_rows" title="行数" width="90" sortable></vxe-column>
    <vxe-column field="human.total_size" title="表尺寸" width="120" sortable></vxe-column>
    <vxe-column field="human.data_size" title="数据大小" width="120" sortable></vxe-column>
    <vxe-column field="human.index_size" title="索引大小" width="120" sortable></vxe-column>
    <vxe-column field="human.data_free_size" title="碎片大小" width="120" sortable></vxe-column>
    <vxe-column field="human.avg_row_size" title="平均行尺寸" width="120" sortable></vxe-column>
    <vxe-column field="update_time" title="更新时间" width="140" sortable></vxe-column>
    <vxe-column field="partition_description" title="分区注释" width="140"></vxe-column>
  </vxe-table>
</template>

<style scoped lang="scss"></style>
