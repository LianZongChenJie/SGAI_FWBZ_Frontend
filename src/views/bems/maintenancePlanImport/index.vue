<template>
  <div class="maintenance-plan-import">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchForm" :model="searchForm" size="default" inline label-position="right">
            <el-form-item label="年份：">
              <!-- <el-date-picker type="year" v-model="searchForm.year" value-format="yyyy"
                :clearable="false"></el-date-picker> -->
              <el-date-picker v-model="year" type="year" format="YYYY" value-format="YYYY" :clearable="false"
                @change="handleYear" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="ArrowLeftBold" @click="prevYear()">上一年</el-button>
              <el-button type="primary" :icon="ArrowRightBold" @click="nextYear()">下一年</el-button>
            </el-form-item>
          </el-form>
          <div class="search-box-button">
            <el-button size="default" type="primary" :icon="RefreshRight" @click="resetSearchForm">重置</el-button>
            <el-button size="default" type="primary" :icon="Search" @click="search()">查询</el-button>
          </div>
        </div>
        <div class="search-tools">
          <el-button size="default" type="primary" :icon="Download" @click="downloadUrl"
            v-permission="'daoru-download'"><a style="color: #fff;text-decoration: none">下载模板</a></el-button>
          <el-button size="default" type="primary" :icon="Upload" @click="dialogVisible = true"
            v-permission="'daoru-leadingin'">导入计划</el-button>
          <el-button size="default" type="primary" :icon="Delete" @click="deletePlanEvent()"
            v-permission="'daoru-del'">删除计划</el-button>
        </div>
        <el-table ref="multiLevelTable" class="multi-level-header" :data="planList" tooltip-effect="dark" border>
          <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
          <el-table-column v-for="(column, index) in tableHeader" :key="index" :label="column.name" :prop="column.field"
            align="center" :width="column.columnWidth" show-overflow-tooltip>
            <template v-slot="scope">
              <template v-if="column.children">
                <el-table-column v-for="column1 in column.children" :key="column1.name" :label="column1.name"
                  align="center">
                  <el-table-column v-for="column2 in column1.children" :key="column2.field" :label="column2.name"
                    :prop="column2.field" align="center" min-width="100"></el-table-column>
                </el-table-column>
              </template>
              <template>
                <span v-if="
                  column.field === 'associatedDevice' ||
                  column.field === 'associatedSpace'
                ">
                  {{ scope.row[column.field] ? '是' : '否' }}
                </span>
                <span v-else>{{ scope.row[column.field] }}</span>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <!-- 导入计划弹出框 -->
    <el-dialog :close-on-click-modal="false" title="导入计划" width="480px" v-model="dialogVisible"
      :before-close="closeImport">
      <!-- <el-upload ref="upload" :headers="headers" :action="`${this.deviceURL}/admin/planModel/importTemplate`" :auto-upload="false" accept=".xlsx,.xls" :file-list="fileList" :show-file-list="true" :on-change="fileChange" :on-success="uploadSuccess"> -->
      <el-upload ref="upload" action="" :auto-upload="false" accept=".xlsx,.xls" :file-list="fileList"
        :show-file-list="true" :on-change="fileChange" :http-request="planUpload">
        <template #trigger>
          <el-button type="primary">选取文件</el-button>
        </template>
        <template #tip>
          <div style="color: #f36767;">只能上传excel文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="closeImport">取 消</el-button>
        <el-button type="primary" @click="submitUpload" :disabled="saving">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import moment from 'moment'
import { ArrowRightBold, ArrowLeftBold, Search, RefreshRight, Upload, Download, Delete } from '@element-plus/icons-vue'
import { constants } from 'node:buffer'
import { getPlanListApi, importTemplateApi, exportTemplateApi } from './Standardized.api'
import { set } from 'nprogress'

const handleYear = (val) => {
  console.log('handleYear--------------->', val);

}

const upload = ref()

const year = ref(moment().format('YYYY'))

const loading = ref(false)
const searchForm = ref({
  year: moment().format('YYYY'),
})

const planList = ref([])
const dialogVisible = ref(false)
const fileList: any = ref([])
const tableHeader: any = ref([
  {
    "field": "name",
    "name": "计划工作项目",
    "children": null
  },
  {
    "field": "count",
    "name": "数量",
    "children": null
  },
  {
    "field": "factory",
    "name": "厂家",
    "children": null
  },
  {
    "field": "associatedDevice",
    "name": "是否关联设备",
    "children": null
  },
  {
    "field": "cycle",
    "name": "维保周期",
    "children": null
  },
  {
    "field": "unit",
    "name": "单位",
    "children": null
  },
  {
    "field": "frequency",
    "name": "建议频次",
    "children": null
  },
  {
    "field": "duration",
    "name": "持续执行时间",
    "children": null
  },
  {
    "field": "principal",
    "name": "负责人",
    "children": null
  },
  {
    "field": "department",
    "name": "执行科组",
    "children": null
  },
  {
    "field": "weibaoType",
    "name": "类型",
    "children": null
  },
  {
    "field": null,
    "name": "时间安排",
    "children": [
      {
        "field": null,
        "name": "1月",
        "children": [
          {
            "field": "w1",
            "name": "第1周(1-2)",
            "children": null
          },
          {
            "field": "w2",
            "name": "第2周(5-9)",
            "children": null
          },
          {
            "field": "w3",
            "name": "第3周(12-16)",
            "children": null
          },
          {
            "field": "w4",
            "name": "第4周(19-23)",
            "children": null
          },
          {
            "field": "w5",
            "name": "第5周(26-30)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "2月",
        "children": [
          {
            "field": "w6",
            "name": "第6周(2-6)",
            "children": null
          },
          {
            "field": "w7",
            "name": "第7周(9-13)",
            "children": null
          },
          {
            "field": "w8",
            "name": "第8周(16-20)",
            "children": null
          },
          {
            "field": "w9",
            "name": "第9周(23-27)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "3月",
        "children": [
          {
            "field": "w10",
            "name": "第10周(2-6)",
            "children": null
          },
          {
            "field": "w11",
            "name": "第11周(9-13)",
            "children": null
          },
          {
            "field": "w12",
            "name": "第12周(16-20)",
            "children": null
          },
          {
            "field": "w13",
            "name": "第13周(23-27)",
            "children": null
          },
          {
            "field": "w14",
            "name": "第14周(30-3)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "4月",
        "children": [
          {
            "field": "w15",
            "name": "第15周(6-10)",
            "children": null
          },
          {
            "field": "w16",
            "name": "第16周(13-17)",
            "children": null
          },
          {
            "field": "w17",
            "name": "第17周(20-24)",
            "children": null
          },
          {
            "field": "w18",
            "name": "第18周(27-1)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "5月",
        "children": [
          {
            "field": "w19",
            "name": "第19周(4-8)",
            "children": null
          },
          {
            "field": "w20",
            "name": "第20周(11-15)",
            "children": null
          },
          {
            "field": "w21",
            "name": "第21周(18-22)",
            "children": null
          },
          {
            "field": "w22",
            "name": "第22周(25-29)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "6月",
        "children": [
          {
            "field": "w23",
            "name": "第23周(1-5)",
            "children": null
          },
          {
            "field": "w24",
            "name": "第24周(8-12)",
            "children": null
          },
          {
            "field": "w25",
            "name": "第25周(15-19)",
            "children": null
          },
          {
            "field": "w26",
            "name": "第26周(22-26)",
            "children": null
          },
          {
            "field": "w27",
            "name": "第27周(29-3)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "7月",
        "children": [
          {
            "field": "w28",
            "name": "第28周(6-10)",
            "children": null
          },
          {
            "field": "w29",
            "name": "第29周(13-17)",
            "children": null
          },
          {
            "field": "w30",
            "name": "第30周(20-24)",
            "children": null
          },
          {
            "field": "w31",
            "name": "第31周(27-31)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "8月",
        "children": [
          {
            "field": "w32",
            "name": "第32周(3-7)",
            "children": null
          },
          {
            "field": "w33",
            "name": "第33周(10-14)",
            "children": null
          },
          {
            "field": "w34",
            "name": "第34周(17-21)",
            "children": null
          },
          {
            "field": "w35",
            "name": "第35周(24-28)",
            "children": null
          },
          {
            "field": "w36",
            "name": "第36周(31-4)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "9月",
        "children": [
          {
            "field": "w37",
            "name": "第37周(7-11)",
            "children": null
          },
          {
            "field": "w38",
            "name": "第38周(14-18)",
            "children": null
          },
          {
            "field": "w39",
            "name": "第39周(21-25)",
            "children": null
          },
          {
            "field": "w40",
            "name": "第40周(28-2)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "10月",
        "children": [
          {
            "field": "w41",
            "name": "第41周(5-9)",
            "children": null
          },
          {
            "field": "w42",
            "name": "第42周(12-16)",
            "children": null
          },
          {
            "field": "w43",
            "name": "第43周(19-23)",
            "children": null
          },
          {
            "field": "w44",
            "name": "第44周(26-30)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "11月",
        "children": [
          {
            "field": "w45",
            "name": "第45周(2-6)",
            "children": null
          },
          {
            "field": "w46",
            "name": "第46周(9-13)",
            "children": null
          },
          {
            "field": "w47",
            "name": "第47周(16-20)",
            "children": null
          },
          {
            "field": "w48",
            "name": "第48周(23-27)",
            "children": null
          },
          {
            "field": "w49",
            "name": "第49周(30-4)",
            "children": null
          }
        ]
      },
      {
        "field": null,
        "name": "12月",
        "children": [
          {
            "field": "w50",
            "name": "第50周(7-11)",
            "children": null
          },
          {
            "field": "w51",
            "name": "第51周(14-18)",
            "children": null
          },
          {
            "field": "w52",
            "name": "第52周(21-25)",
            "children": null
          },
          {
            "field": "w53",
            "name": "第53周(28-1)",
            "children": null
          }
        ]
      }
    ]
  }
])
const saving = ref(false)

const downloadUrl = async () => {
  let res = await exportTemplateApi({
    year: year.value,
    labelType: 'maintenance',
  })
  console.log('downloadUrl----------->', res);
  
  if (res) {
    let name = `${year.value}年设备维保模板`;
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xls';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  } else {
    // 返回json
    // this.$message.warning(res.data.msg)
  }
  // this.rq({
  //   baseURL: this.deviceURL,
  //   url: '/admin/planModel/exportTemplate',
  //   method: 'get',
  //   params: { year: searchForm.value.year, labelType: '维保' },
  //   headers: {
  //     // 'Auth-Token': getToken(),
  //   },
  //   responseType: 'blob',
  // })
  //   .then((res) => {
  //     if (res.type) {
  //       // 文件下载
  //       const blob = new Blob([res])

  //       let link = document.createElement('a')
  //       link.href = URL.createObjectURL(blob)
  //       // console.log("========", blob);
  //       link.setAttribute(
  //         'download',
  //         `${this.searchForm.year}年设备维保模板.xls`
  //       )
  //       link.click()
  //       link = null
  //       // this.btnLoading = false;
  //       // this.$message.success('下载成功')
  //     } else {
  //       // 返回json
  //       // this.$message.warning(res.data.msg)
  //     }
  //   })
  //   .catch((err) => {
  //     // this.$message.error('下载失败')
  //   })
}

const getPlanList = async () => {
  let res = await getPlanListApi({
    year: year.value,
    labelType: 'maintenance',
  })
  if (res) {
    let tableHeader = res.tableHeader.children || []
    tableHeader.forEach((v, idx) => {
      const widthMap = {
        0: 200,
        1: 80,
      }
      v.columnWidth = widthMap[idx] || 120
    })
    tableHeader.value = tableHeader
    planList.value = res.planModelList
    // dataNull(this.planList)
  }
}

const search = async () => {
  // page.value = 1
  await getPlanList()
}
const resetSearchForm = () => {
  searchForm.value.year = moment().format('YYYY')
}
const prevYear = () => {
  year.value = moment(year.value)
    .subtract(1, 'years')
    .format('YYYY')

}
const nextYear = () => {
  year.value = moment(year.value)
    .add(1, 'years')
    .format('YYYY')
}
const submitUpload = () => {
  upload.value.submit()
}
const closeImport = () => {
  dialogVisible.value = false
  // this.$refs['upload'].clearFiles()
}
const uploadSuccess = async (res) => {
  if (res.code === 1000 || res.code === 1001) {
    // this.$message.success(res.msg ? res.msg : '上传成功！')
    // this.$refs.upload.clearFiles()
    dialogVisible.value = false
    await getPlanList()
  } else {
    // this.$message.error(res.msg)
  }
}



//导入计划---改
const planUpload = async () => {
  const data = new FormData()
  data.append('file', fileList.value[0].raw)
  data.append('labelType', 'maintenance')
  saving.value = true
  let res = await importTemplateApi(data)

  // this.rq({
  //   headers: { 'Content-Type': 'multipart/form-data' },
  //   baseURL: this.deviceURL,
  //   url: '/admin/planModel/importTemplate',
  //   method: 'post',
  //   data: data,
  //   responseType: 'blob',
  // })
  //   .then(async (res) => {
  //     saving.value = false
  //     if (res.type === 'application/vnd.ms-excel') {
  //       const blob = new Blob([res], {
  //         type: 'application/vnd.ms-excel;charset=UTF-8',
  //       })
  //       // 文件下载
  //       let link = document.createElement('a')
  //       const url = URL.createObjectURL(blob)
  //       link.href = url
  //       link.setAttribute('download', `消防导入结果.xlsx`)
  //       link.click()
  //       link = null
  //       window.URL.revokeObjectURL(url)
  //       // $refs.upload.clearFiles()
  //       dialogVisible.value = false
  //       await getPlanList()
  //     }
  //   })
  //   .catch((err) => {
  //     saving.value = false
  //     // this.$message.error(err)
  //     console.error(err)
  //   })
}
const fileChange = (file, list) => {
  if (list.length > 0) {
    fileList.value = [list[list.length - 1]] // 覆盖上一次的文件
  }
}
const deletePlanEvent = () => {
  this.$confirm('删除不可恢复，确认删除该数据？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      this.rq({
        baseURL: this.deviceURL,
        url: '/admin/planModel/remove',
        method: 'post',
        params: { year: searchForm.value.year },
      })
        .then(async (res) => {
          if (res.code === 1000 || res.code === 1001) {
            // this.$message.success(res.msg ? res.msg : '操作成功!')
            await getPlanList()
          } else {
            // this.$message.error(res.msg)
          }
        })
        .catch(() => { })
    })
    .catch(() => { })
}

onMounted(async () => {
  searchForm.value.year = moment().format('yyyy')
  await getPlanList()
})

</script>

<style lang="less" scoped>
.maintenance-plan-import {
  height: 88vh;
  background-color: #fff;

  .search-box {
    display: flex;
  }

  .search-tools {}
}
</style>