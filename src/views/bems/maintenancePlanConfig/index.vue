<template>
  <div class="maintenance-plan-config-main-box">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchForm" :model="planSearchForm" size="mini" inline label-position="right">
            <el-form-item label="年份：">
              <!-- <el-date-picker type="year" :clearable="false" v-model="planSearchForm.search_EQ_year"
                value-format="yyyy"></el-date-picker> -->
              <el-date-picker v-model="year" type="year" format="YYYY" value-format="YYYY" :clearable="false" />
            </el-form-item>
            <el-form-item>
              <div class="search-box-button">
                <el-button size="default" type="primary" :icon="RefreshRight" @click="resetSearchForm">重置</el-button>
                <el-button size="default" type="primary" :icon="Search" @click="search">查询</el-button>
              </div>
            </el-form-item>
          </el-form>

        </div>
        <el-table :data="planList" tooltip-effect="dark" border>
          <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
          <el-table-column prop="name" label="计划工作项目" min-width="120" align="center"></el-table-column>
          <!--          <el-table-column prop="" label="描述" show-overflow-tooltip align="center"></el-table-column>-->
          <el-table-column prop="count" label="数量" show-overflow-tooltip align="center"></el-table-column>
          <!-- <el-table-column prop="" label="是否关联设备" width="120" align="center">
            <template slot-scope="{ row }">
              <el-button v-if="row.associatedDevice" type="text" style="cursor:pointer" size="mini"
                @click="checkEqData(row)">是</el-button>
              <span v-else>否</span>
            </template>
</el-table-column> -->
          <el-table-column prop="cycle" label="维保周期" show-overflow-tooltip align="center" width="100"></el-table-column>
          <el-table-column prop="unit" label="单位" show-overflow-tooltip align="center" width="80"></el-table-column>
          <!-- <el-table-column label="操作" align="center" width="100">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" v-if="row.associatedDevice" @click="toSelectDevice(row)"
                v-permission="'peizhi-guanlian'">关联设备</el-button>
              <span v-else>无</span>
            </template>
          </el-table-column> -->
        </el-table>
        <el-pagination class="pagination-box" @size-change="handleSizeChange" @current-change="handleCurrentChange"
          background :current-page="planPageInfo.page" :page-sizes="[10, 20, 50]" :page-size="planPageInfo.pagesize"
          :total="planPageInfo.total" layout="total,prev, pager, next, sizes,jumper"
          v-show="planList.length"></el-pagination>
      </el-main>
    </el-container>
    <!-- 关联设备弹出框 -->
    <!-- 选择设备弹框 -->
    <!-- <el-dialog :close-on-click-modal="false" title="选择设备" width="1300px" :visible.sync="deviceVisible"
      :append-to-body="true" class="dialog-box" :before-close="closeDeviceDialog">
      <el-scrollbar class="scrollbar-hidden-x dialog-scrollbar">
        <div class="dialog-scrollbar-main">
          <div class="page-main">
            <el-container>
              <el-header>
                <ul>
                  <li v-for="(item, index) in navDeviceArr" :class="{ active: index === activeDeviceIndex }"
                    @click="navClick(item, index, 'device')" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </el-header>
              <el-container v-if="activeDeviceIndex == 0">
                <el-main class="table-main">
                  <order-tube v-if="activeDeviceIndex == 0" :eqTable="selectedDeviceRes" :tubeFlag="selectFlag"
                    @update-eq-data="updateEqData"></order-tube>
                </el-main>
              </el-container>
              <el-container v-else>
                <el-main class="table-main">
                  <div class="search-box clearfix">
                    <el-form class="form-main" ref="searchForm" :model="deviceSearchForm" size="mini" inline
                      label-width="90px" label-position="right">
                      <el-form-item label="所属系统：">
                        <el-cascader ref="" placeholder="所属系统" :options="systemData" :props="defaultProps"
                          v-model="systemIds" :clearable="false" style="width:100%" @change="getSystemVal"
                          :show-all-levels="false"></el-cascader>
                      </el-form-item>
                      <el-form-item label="设备类型：">
                        <el-input v-model="deviceSearchForm.specialityName" placeholder="设备类型" clearable></el-input>
                      </el-form-item>
                      <el-form-item label="设备名称：">
                        <el-input v-model="deviceSearchForm.deviceName" placeholder="设备名称" clearable></el-input>
                      </el-form-item>

                      <el-form-item label="楼层：">
                        <el-select v-model="deviceSearchForm.spaceLayer" placeholder="楼层" clearable>
                          <el-option v-for="item in spaceLayerList" :key="item.id" :label="item.fullName"
                            :value="item.fullName"></el-option>
                        </el-select>
                      </el-form-item>
                      <div class="search-box-button">
                        <el-button size="mini" type="primary" icon="el-icon-refresh-left"
                          @click="resetDeviceSearchForm">重置</el-button>
                        <el-button size="mini" type="primary" icon="el-icon-search"
                          @click="searchDeviceList">查询</el-button>
                      </div>
                    </el-form>
                  </div>
                  <el-row>
                    <el-col :span="18">
                      <el-table ref="deviceTable" :data="deviceList" row-key="id" tooltip-effect="dark"
                        @select="handleSelect" @select-all="handleSelectAll" border>
                        <el-table-column type="selection" width="55" align="center"
                          :reserve-selection="true"></el-table-column>
                        <el-table-column prop="name" label="设备名称" show-overflow-tooltip
                          align="center"></el-table-column>
                        <el-table-column prop="type" label="设备类型" show-overflow-tooltip
                          align="center"></el-table-column>
                        <el-table-column prop="spaceLayer" label="设备楼层" show-overflow-tooltip
                          align="center"></el-table-column>
                        <el-table-column prop="spaceFullPath" label="设备位置" show-overflow-tooltip
                          align="center"></el-table-column>
                      </el-table>
                      <el-pagination class="pagination-box" @size-change="handleDeviceListSizeChange"
                        @current-change="handleDeviceListCurrentChange" background
                        :current-page="deviceListPageInfo.page" :page-sizes="[10, 20, 50]"
                        :page-size="deviceListPageInfo.pagesize" :total="deviceListPageInfo.total"
                        layout="prev, pager, next, sizes,jumper" v-show="deviceList.length"></el-pagination>
                    </el-col>
                    <el-col :span="6" class="selected-div">
                      <div class="selected-devices">已选设备</div>
                      <el-table ref="selectedDeviceTable" :data="selectedDeviceRes" tooltip-effect="dark" border
                        style="width: 100%">
                        <el-table-column width="55" align="center" v-if="selectedDeviceRes.length">
                          <template slot-scope="scope"><span class="button-danger"
                              @click="deleteSelectedDevice(scope.row)">删除</span></template>
                        </el-table-column>
                        <el-table-column prop="name" label="设备名称" show-overflow-tooltip
                          align="center"></el-table-column>
                        <el-table-column prop="deviceId" label="设备ID" show-overflow-tooltip
                          align="center"></el-table-column>
                      </el-table>
                    </el-col>
                  </el-row>
                </el-main>
              </el-container>
            </el-container>
          </div>
        </div>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDeviceDialog">取 消</el-button>
        <el-button type="primary" @click="sumbitSelectedDevice">确 定</el-button>
      </div>
    </el-dialog> -->
    <!--已关联设备-->
    <!-- <el-dialog :close-on-click-modal="false" title="已关联设备" width="980px" :visible.sync="eqVisible"
      :append-to-body="true" class="dialog-box">
      <el-scrollbar class="scrollbar-hidden-x dialog-scrollbar">
        <div class="dialog-scrollbar-main">
          <el-form ref="repairForm" size="small" label-width="100px">
            <el-table ref="eqtable" :data="selectedDeviceRes" tooltip-effect="dark" border>
              <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
              <el-table-column prop="deviceId" label="设备ID" align="center" show-overflow-tooltip
                width="80"></el-table-column>
              <el-table-column prop="name" label="设备名称" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column prop="spaceLayer" label="楼层" align="center" show-overflow-tooltip
                width="80"></el-table-column>
              <el-table-column prop="spaceFullPath" label="位置" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template slot-scope="{ row }">
                  <el-button class="button-danger" size="mini" type="text" @click="toDelete(row)"
                    style="cursor:pointer">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </div>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="eqVisible = false">关 闭</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import moment from 'moment'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { getPlanConfigListApi } from './Standardized.api'

const selectFlag = ref(true)
const defaultProps = ref({
  value: 'id',
  children: 'children',
  checkStrictly: true,
  label: 'name',
})
const systemIds = ref([])
const systemData = ref([])
const eqVisible = ref(false)
const loading = ref(false)
const planSearchForm = ref({
  search_EQ_year: moment().format('yyyy'),
})
const year = ref('')
const planPageInfo = ref({
  page: 1,
  pagesize: 10,
  total: 0,
})
const planList = ref([])
const deviceVisible = ref(false)
const activeDeviceIndex = ref(1)
const navDeviceArr = ref(['图选', '列表'])
const searchForm = ref({
  search_LIKE_userName: '',
})
const options = ref([])
const page = ref(1)
const pagesize = ref(10)
const total = ref(200)
const tableData = ref([])
const selectedDeviceRes = ref([])
const deviceSearchForm = ref({
  deviceName: '',
  search_EQ_specialitySystem: '',
  spaceLayer: '',
  specialityName: '',
})
const deviceList = ref([])
const deviceListPageInfo = ref({
  page: 1,
  pagesize: 10,
  total: 0,
})
// systemList: [],
const spaceLayerList = ref([])
// typeIdList: [],
const selectAllData = ref([])
const rowId = ref(null)

// toDelete(row) {
//   // console.log("row", row);
//   this.$confirm('删除不可恢复，确认删除该数据？', '提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//   })
//     .then(() => {
//       this.rq({
//         baseURL: this.deviceURL,
//         url: '/admin/planModel/deleteDeviceByIds',
//         method: 'post',
//         contentType: 'application/x-www-form-urlencoded',
//         data: { ids: row.deviceId, modelId: this.rowId },
//       })
//         .then((res) => {
//           if (res.code === 1000 || res.code === 1001) {
//             this.getSelectedDevice(this.rowId)
//             this.$message.success(res.msg ? res.msg : '操作成功!')
//           } else {
//             this.$message.error(res.msg)
//           }
//         })
//         .catch(() => { })
//     })
//     .catch(() => { })
// },
// navClick(item, index, tabPage) {
//   this.activeDeviceIndex = index
//   if (this.activeDeviceIndex == 1) {
//     this.handleDeviceListSizeChange()
//   }
// },
// closeDeviceDialog() {
//   this.deviceVisible = false
//   this.activeDeviceIndex = 1
//   this.resetDeviceSearchForm()
// },
// updateEqData(data) {
//   // this.eqtable = data;
//   this.selectedDeviceRes = data
//   // console.log("updateEqData~~~~~~", this.selectedDeviceRes);
// },
// getSystemVal(val) {
//   this.deviceSearchForm.parentSpecialityId = val[val.length - 1]
// },
//获取树结构
// getTree() {
//   this.loading = true
//   this.rq({
//     baseURL: this.deviceURL,
//     url: '/admin/deviceType/queryDeviceTypeTree',
//     method: 'get',
//     params: { treeDepth: 3 },
//   })
//     .then((res) => {
//       this.loading = false
//       if (res.code == 1000 || res.code == 1001) {
//         this.handleSystemData(res.data)
//         this.regDisabled(res.data)
//         this.systemData = res.data
//       }
//     })
//     .catch((err) => {
//       this.loading = false
//     })
// },
// handleSystemData(data) {
//   data.forEach((item) => {
//     if (item.children) {
//       if (item.children.length !== 0) {
//         this.handleSystemData(item.children)
//       } else {
//         item.children = undefined
//       }
//     }
//   })
// },
//最后一级才可以选
// regDisabled(data) {
//   data.forEach((item) => {
//     item.disabled = item.level != 3
//     if (Array.isArray(item.children) && item.children.length > 0) {
//       this.regDisabled(item.children)
//     }
//   })
// },
//查询已关联数据
// checkEqData(data) {
//   // console.log("checkEqData", data);
//   this.eqVisible = data.associatedDevice ? true : false
//   this.rowId = data.id
//   this.getSelectedDevice(data.id)
// },
// getSpaceLayerList() {
//   this.rq({
//     baseURL: this.deviceURL,
//     url: '/admin/device/account/getSpaceInfoList',
//     method: 'get',
//     params: {
//       spaceTypeCode: 'A04',
//       clientId: 'gjdjypark',
//     },
//   }).then((res) => {
//     if (res.code === 1001 || res.code == 1000) {
//       this.spaceLayerList = res.data
//       // console.log("louceng", this.spaceLayerList);
//     }
//   })
// },
// searchDeviceList() {
//   this.deviceListPageInfo.page = 1
//   this.getDeviceList()
// },
// const getDeviceList = () => {
//   const data = {
//     page: this.deviceListPageInfo.page,
//     pagesize: this.deviceListPageInfo.pagesize,
//     search_EQ_accountClass: '设备台账',
//   }
//   for (let key in this.deviceSearchForm) {
//     if (this.deviceSearchForm[key]) {
//       data[key] = this.deviceSearchForm[key]
//     }
//   }
//   return new Promise((resolve) => {
//     this.rq({
//       baseURL: this.deviceURL,
//       url: '/admin/device/account/queryDeviceAccountPage',
//       method: 'get',
//       params: data,
//     }).then((res) => {
//       if (res.code === 1001 || res.code === 1000) {
//         this.deviceList = res.data.list
//         dataNull(this.deviceList)
//         this.deviceListPageInfo.total = res.data.total
//         resolve(res.data.list)
//       }
//     })
//   })
// }
// handleDeviceListSizeChange(val) {
//   this.deviceListPageInfo.pagesize = val
//   this.getDeviceList().then(() => {
//     this.$nextTick(() => {
//       this.selectedDeviceRes.forEach((selected) => {
//         this.deviceList.forEach((item) => {
//           if (selected.id === item.id) {
//             this.$refs.deviceTable.toggleRowSelection(item, true)
//           }
//         })
//       })
//     })
//   })
// },
// handleDeviceListCurrentChange(val) {
//   this.deviceListPageInfo.page = val
//   this.getDeviceList().then(() => {
//     this.$nextTick(() => {
//       this.selectedDeviceRes.forEach((selected) => {
//         this.deviceList.forEach((item) => {
//           if (selected.id === item.id) {
//             this.$refs.deviceTable.toggleRowSelection(item, true)
//           }
//         })
//       })
//     })
//   })
// },
const getPlanList = async () => {
  // this.loading = true
  const data = {
    page: planPageInfo.value.page,
    pagesize: planPageInfo.value.pagesize,
    search_EQ_labelType: 'maintenance',
    search_EQ_year: year.value
  }
  // for (let key in planSearchForm.value) {
  //   if (planSearchForm.value[key]) {
  //     data[key] = planSearchForm.value[key]
  //   }
  // }

  let res = await getPlanConfigListApi(data)
  planList.value = res.list
  // dataNull(this.planList)
  planPageInfo.value.total = res.total
}
const handleSizeChange = (val) => {
  planPageInfo.value.page = 1
  planPageInfo.value.pagesize = val
  getPlanList()
}
const handleCurrentChange = (val) => {
  planPageInfo.value.page = val
  getPlanList()
}
const search = () => {
  page.value = 1
  getPlanList()
}
const resetSearchForm = () => {
  // planSearchForm.value.search_EQ_year = moment().format('yyyy')
  year.value = moment().format('yyyy')
}
// const resetDeviceSearchForm = () => {
//   for (let key in this.deviceSearchForm) {
//     this.deviceSearchForm[key] = ''
//   }
//   this.systemIds = []
// }
// const toSelectDevice = (row) => {
//   // console.log('%%%toSelectDevice')
//   this.curConfigId = row.id
//   this.deviceVisible = true
//   if (this.$refs.deviceTable) {
//     this.$nextTick(() => {
//       this.$refs.deviceTable.clearSelection()
//     })
//   }
//   this.deviceListPageInfo.page = 1
//   this.getSelectedDevice(this.curConfigId).then(() => {
//     this.getDeviceList().then(() => {
//       this.$nextTick(() => {
//         this.selectedDeviceRes.forEach((selected) => {
//           this.deviceList.forEach((item) => {
//             if (selected.id === item.id) {
//               this.$refs.deviceTable.toggleRowSelection(item, true)
//             }
//           })
//         })
//       })
//     })
//   })
//   // console.log("关联设备", this.selectedDeviceRes);
// }
// //获取已选设备
// const getSelectedDevice = (id) => {
//   return new Promise((resolve) => {
//     this.rq({
//       baseURL: this.deviceURL,
//       url: '/admin/planModel/getDeviceListByPlanId',
//       method: 'get',
//       params: {
//         id: id,
//       },
//     }).then((res) => {
//       if (res.code === 1001 || res.code === 1000) {
//         if (res.data) {
//           this.selectedDeviceRes = res.data
//           // console.log("获取已选设备selectedDeviceRes", this.selectedDeviceRes);
//           dataNull(this.selectedDeviceRes)
//           resolve(res.data)
//         }
//       } else {
//         this.$message.error(res.msg)
//       }
//     })
//   })
// }
// const handleSelect = (selection, row) => {
//   if (selection.length) {
//     selection.forEach((item) => {
//       if (item.id === row.id) {
//         //添加
//         this.selectedDeviceRes.push(row)
//       } else {
//         //删除
//         this.selectedDeviceRes.forEach((item, index) => {
//           if (item.id === row.id) {
//             this.selectedDeviceRes.splice(index, 1)
//           }
//         })
//       }
//     })
//   } else {
//     //删除
//     this.selectedDeviceRes.forEach((item, index) => {
//       if (item.id === row.id) {
//         this.selectedDeviceRes.splice(index, 1)
//       }
//     })
//   }
// },
// handleSelectAll(selection) {
//   if (selection.length) {
//     let res = [...selection, ...this.selectedDeviceRes]
//     let obj = {}
//     let resArr = res.reduce((cur, next) => {
//       if (!obj[next.id]) {
//         obj[next.id] = true
//         cur.push(next)
//       }
//       //  obj[next.id] ? "" : obj[next.id] = true && cur.push(next)
//       return cur
//     }, [])
//     this.selectedDeviceRes = resArr
//   } else {
//     let resArr = this.selectedDeviceRes.filter((item) => {
//       let idList = this.deviceList.map((d) => d.id)
//       return !idList.includes(item.id)
//     })
//     this.selectedDeviceRes = resArr
//   }
// },
// sumbitSelectedDevice() {
//   const data = {
//     id: this.curConfigId,
//     relateList: this.selectedDeviceRes.map((item) => item.deviceId),
//   }
//   if (!data.relateList.length) {
//     this.$message.error('请选择关联设备！')
//     return
//   }
//   this.rq({
//     baseURL: this.deviceURL,
//     url: '/admin/planModel/associativeDevice',
//     method: 'post',
//     data: data,
//   }).then((res) => {
//     if (res.code === 1001) {
//       this.activeDeviceIndex = 1
//       this.$message.success('关联成功！')
//       this.deviceVisible = false
//     }
//   })
// },
// deleteSelectedDevice(val) {
//   this.selectedDeviceRes.forEach((select, index) => {
//     if (select.id === val.id) {
//       this.selectedDeviceRes.splice(index, 1)
//     }
//   })
//   this.deviceList.forEach((device) => {
//     if (device.id === val.id) {
//       this.$refs.deviceTable.toggleRowSelection(device, false)
//     }
//   })
// },
// toggleSelected(table, rows, toggle) {
//   if (rows) {
//     rows.forEach((row) => {
//       table.toggleRowSelection(row, toggle)
//     })
//   } else {
//     table.clearSelection()
//   }
// },

onMounted(async () => {
  planSearchForm.value.search_EQ_year = moment().format('yyyy')
  year.value = moment().format('yyyy')
  await getPlanList()
})

</script>

<style lang="less" scoped>
.maintenance-plan-config-main-box {
  background-color: #fff;

  .search-box .search-box-button {
    display: inline-block !important;
    margin-left: 20px;
    float: none;
  }
}
</style>