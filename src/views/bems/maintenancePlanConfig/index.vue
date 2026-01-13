<template>
  <div class="maintenance-plan-config-main-box">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchForm" :model="planSearchForm" size="mini" inline label-position="right">
            <el-form-item label="年份：">
              <el-date-picker type="year" :clearable="false" v-model="planSearchForm.search_EQ_year"
                value-format="yyyy"></el-date-picker>
            </el-form-item>
          </el-form>
          <div class="search-box-button">
            <el-button size="mini" type="primary" icon="el-icon-refresh-left" @click="resetSearchForm">重置</el-button>
            <el-button size="mini" type="primary" icon="el-icon-search" @click="search">查询</el-button>
          </div>
        </div>
        <el-table :data="planList" tooltip-effect="dark" border>
          <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
          <el-table-column prop="name" label="计划工作项目" min-width="120" align="center"></el-table-column>
          <!--          <el-table-column prop="" label="描述" show-overflow-tooltip align="center"></el-table-column>-->
          <el-table-column prop="count" label="数量" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="" label="是否关联设备" width="120" align="center">
            <template slot-scope="{ row }">
              <el-button v-if="row.associatedDevice" type="text" style="cursor:pointer" size="mini"
                @click="checkEqData(row)">是</el-button>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column prop="cycle" label="维保周期" show-overflow-tooltip align="center" width="100"></el-table-column>
          <el-table-column prop="unit" label="单位" show-overflow-tooltip align="center" width="80"></el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" v-if="row.associatedDevice" @click="toSelectDevice(row)"
                v-permission="'peizhi-guanlian'">关联设备</el-button>
              <span v-else>无</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="pagination-box" @size-change="handleSizeChange" @current-change="handleCurrentChange"
          background :current-page="planPageInfo.page" :page-sizes="[10, 20, 50]" :page-size="planPageInfo.pagesize"
          :total="planPageInfo.total" layout="total,prev, pager, next, sizes,jumper"
          v-show="planList.length"></el-pagination>
      </el-main>
    </el-container>
    <!-- 关联设备弹出框 -->
    <!-- 选择设备弹框 -->
    <el-dialog :close-on-click-modal="false" title="选择设备" width="1300px" :visible.sync="deviceVisible"
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
                        <!-- <el-input v-model="deviceSearchForm.search_EQ_specialitySystem" placeholder="所属系统" clearable></el-input> -->
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
                        <!-- <el-table-column prop="did" label="设备ID" width="120" align="center"></el-table-column> -->
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
    </el-dialog>
    <!--已关联设备-->
    <el-dialog :close-on-click-modal="false" title="已关联设备" width="980px" :visible.sync="eqVisible"
      :append-to-body="true" class="dialog-box">
      <el-scrollbar class="scrollbar-hidden-x dialog-scrollbar">
        <div class="dialog-scrollbar-main">
          <el-form ref="repairForm" size="small" label-width="100px">
            <!-- <el-form-item label="选择设备：" prop="device"> -->
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
            <!-- </el-form-item> -->
          </el-form>
        </div>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="eqVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import moment from 'moment'

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

</script>

<style lang="less" scoped>
.maintenance-plan-config-main-box {
  .search-box .search-box-button {
    display: inline-block !important;
    margin-left: 20px;
    float: none;
  }
}
</style>