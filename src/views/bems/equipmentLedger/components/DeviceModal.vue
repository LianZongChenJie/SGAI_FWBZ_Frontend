<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="1000" @ok="handleSubmit" @visibleChange="visibleChange">
    <BasicForm v-if="!isUpdate" @register="registerForm">
      <template #modelId="{ model, field }">
        <a-select placeholder="请选择设备模型" v-model:value="model[field]" :options="categoryOption" :disabled="isUpdate"> </a-select>
      </template>
    </BasicForm>
    <a-tabs v-else v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基本信息" destroyInactiveTabPane="true">
        <BasicForm @register="registerForm">
          <template #modelId="{ model, field }">
            <a-select placeholder="请选择设备模型" v-model:value="model[field]" :options="categoryOption" :disabled="isUpdate"> </a-select>
          </template>
        </BasicForm>
      </a-tab-pane>
      <a-tab-pane key="2" tab="设备属性" force-render>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="addItem">新增</a-button>
        <div>
          <a-table
            :dataSource="dataSource"
            :columns="columns"
            bordered
            :scroll="{ y: 150 }"
            size="middle"
            :pagination="false"
            @change="handleDeviceTableChange"
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="['sort', 'readwriteLevel', 'attributeCode', 'unit', 'attributeName'].includes(column.dataIndex)">
                <div>
                  <a-input v-if="editableData[record.key]" v-model:value="editableData[record.key][column.dataIndex]" style="margin: -5px 0" />
                  <template v-else>
                    {{ text }}
                  </template>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <span v-if="editableData[record.key]">
                    <a-typography-link @click="save(record.key)"><a>保存</a></a-typography-link>
                    &ensp;
                    <a-popconfirm title="确认取消?" @confirm="cancel(record)">
                      <a>取消</a>
                    </a-popconfirm>
                  </span>
                  <span v-else>
                    <a @click="edit(record.key)">编辑</a>&ensp;
                    <a-popconfirm title="确认删除该条数据？" ok-text="确定" cancel-text="取消" @confirm="confirmDelete(record)">
                      <a style="color: red">删除</a> </a-popconfirm
                    >&ensp;
                    <a @click="showDrawer(record)">绑定点位</a>
                  </span>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>
    <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: 'blue' }"
      style="color: red"
      title="点位列表"
      placement="right"
      size="large"
    >
      <div class="form-box">
        <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" autocomplete="off">
          <a-row>
            <a-col :span="9">
              <a-form-item label="网关地址" name="gatewayAdr">
                <a-input v-model:value="formState.gatewayAdr" :allowClear="true" />
              </a-form-item>
            </a-col>
            <a-col :span="9">
              <a-form-item label="通信地址" name="bacnetAdr">
                <a-input v-model:value="formState.bacnetAdr" :allowClear="true" />
              </a-form-item>
            </a-col>
            <a-col :span="9">
              <a-form-item label="内容" name="content">
                <a-input v-model:value="formState.content" :allowClear="true" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item>
                <a-button type="primary" @click="searchData">搜索</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-box">
        <a-table
          class="custom-hover-table"
          :dataSource="pointData"
          :columns="pointColumns"
          :pagination="pagination"
          @change="handleTableChange"
          size="middle"
          bordered
          :customRow="rowClick"
        >
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'content'">
              <a-popover>
                <template #content>
                  <p>{{ record.content }}</p>
                </template>
                <div class="content-box">{{ record.content }}</div>
              </a-popover>
            </template>
          </template>
        </a-table>
      </div>
    </a-drawer>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, h, reactive, watch, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { TreeSelect } from 'ant-design-vue';

  import {
    saveOrUpdate,
    getDeviceAttribute,
    getListByDeviceId,
    saveData,
    addData,
    deleteItem,
    getBuildingControlPointListApi,
    bindPointLocationApi,
    spaceTree,
  } from '../Device.api';
  import { cloneDeep } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import type { UnwrapRef } from 'vue';

  const devicePagination = ref({
    pageNo: 1,
    pageSize: 10,
    total: 10,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total) => `共${total}条`,
  });

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const activeKey = ref('1');
  const dataSource = ref();
  const columns = [
    {
      title: '属性名称',
      dataIndex: 'attributeName',
      key: 'attributeName',
      width: 160,
    },
    {
      title: '属性单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '属性编码',
      dataIndex: 'attributeCode',
      key: 'attributeCode',
      width: 120,
    },
    {
      title: '读写级别',
      dataIndex: 'readwriteLevel',
      key: 'readwriteLevel',
      width: 80,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '点位编号',
      dataIndex: 'acquisitionCoding',
      key: 'acquisitionCoding',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 180,
    },
  ];

  const categoryOption = ref();
  const selectCategoryId = async (value, item, val) => {
    if (val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      setFieldsValue({
        categoryId: null,
      });
      return;
    }
    let res = await getDeviceAttribute({ categoryId: value });
    (categoryOption.value = res.map((item) => {
      return {
        value: item.id,
        label: item.modelName,
      };
    })),
      // 更新表单项
      await updateSchema([
        {
          label: '设备模型',
          field: 'modelId',
          component: 'Select',
          required: true,
          componentProps: {
            options: categoryOption.value,
          },
        },
      ]);
  };
  const selectSpaceId = (value, item, val) => {
    if (val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      setFieldsValue({
        spaceId: null,
      });
      return;
    }
  };
  // 表单配置
  const formSchema: any = [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false, // 隐藏此字段
    },
    {
      label: '设备编号',
      field: 'deviceCode',
      component: 'Input',
      required: true,
    },
    {
      label: '设备名称',
      field: 'deviceName',
      component: 'Input',
      required: true,
    },
    {
      label: '设备类别',
      field: 'categoryId',
      component: 'TreeSelect',
      required: true,
      componentProps: {
        treeData: [], // 将由父组件通过 setFieldsValue 设置
        placeholder: '请选择设备类别',
        fieldNames: {
          label: 'title',
          key: 'key',
          value: 'key',
        },
        onChange: selectCategoryId,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'Input',
    },
    // {
    //   label: '倍率',
    //   field: 'magnification',
    //   component: 'InputNumber',
    //   required: true,
    //   componentProps: {
    //     min: 0,
    //     precision: 2,
    //   },
    // },
    // {
    //   label: '自动算法',
    //   field: 'automaticAlgorithm',
    //   component: 'Select',
    //   required: true,
    //   componentProps: {
    //     options: [
    //       { label: '开', value: '1' },
    //       { label: '关', value: '0' },
    //       // 这里需要根据实际数据补充选项
    //     ],
    //   },
    // },
    {
      label: '设备模型',
      field: 'modelId',
      component: 'Select',
      slot: 'modelId',
      // componentProps: {
      //   options: categoryOption.value
      // },
    },
    {
      label: '排序',
      field: 'sort',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        precision: 0,
      },
    },

    {
      label: '设备位置',
      field: 'spaceId',
      component: 'TreeSelect',
      required: true,
      componentProps: {
        treeData: [], // 将由父组件通过 setFieldsValue 设置
        placeholder: '请选择设备位置',
        fieldNames: {
          label: 'title',
          key: 'key',
          value: 'key',
        },
        onChange: selectSpaceId,
      },
    },
  ];
  const id = ref('');
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    rowProps: { gutter: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('data', data);
    const res = await spaceTree({});
    // 设置树形数据
    const { categoryTreeData, spaceTreeData } = data;
    formSchema.forEach((schema) => {
      if (schema.field === 'categoryId') {
        schema.componentProps.treeData = categoryTreeData;
      }
      if (schema.field === 'spaceId') {
        schema.componentProps.treeData = res;
      }
    });
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // await selectCategoryId(data.record.categoryId);
    if (unref(isUpdate)) {
      id.value = data.record.id;
      getData(data.record.id);
      nextTick(async () => {
        await setFieldsValue({
          ...data.record,
          id: data.record.id, // 确保 id 被设置
        });
      });
    }
  });

  const title = computed(() => (!unref(isUpdate) ? '新增设备' : '编辑设备'));

  async function handleSubmit() {
    if (activeKey.value === '1') {
      try {
        const values = await validate();
        setModalProps({ confirmLoading: true });
        await saveOrUpdate(values, unref(isUpdate));
        closeModal();
        emit('success');
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        setModalProps({ confirmLoading: false });
      }
    } else {
      closeModal();
    }
  }

  const getData = async (id) => {
    let res = await getListByDeviceId({
      // pageNo: devicePagination.value.pageNo,
      pageNo: 1,
      // pageSize: devicePagination.value.pageSize,
      pageSize: 999,
      deviceId: id,
    });
    devicePagination.value.total = res.total;
    dataSource.value = res.records;
    dataSource.value.forEach((item, index) => {
      item.key = index;
    });
  };

  const isNullAndUnDef = ref(false);
  const addItem = () => {
    isNullAndUnDef.value = true;
    editableData[dataSource.value.length] = {
      key: dataSource.value.length,
      attributeCode: '',
      attributeName: '',
      readwriteLevel: '',
      sort: '',
      unit: '',
      deviceId: id.value,
    };
    dataSource.value.push({
      key: dataSource.value.length,
      attributeCode: '',
      attributeName: '',
      readwriteLevel: '',
      sort: '',
      unit: '',
      deviceId: id.value,
    });
  };

  interface DataItem {
    key: string;
    name: string;
    age: number;
    address: string;
  }

  const data: DataItem[] = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i.toString(),
      name: `Edrward ${i}`,
      age: 32,
      address: `London Park no. ${i}`,
    });
  }

  const editableData = reactive({});

  const edit = (key: string) => {
    editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.key)[0]);
  };
  const save = async (key: string) => {
    Object.assign(dataSource.value.filter((item) => key === item.key)[0], editableData[key]);
    if (editableData[key].id) {
      await saveData(editableData[key]);
    } else {
      await addData(editableData[key]);
    }
    await getData(id.value);
    delete editableData[key];
  };
  const confirmDelete = (record) => {
    deleteData(record);
  };
  const deleteData = async (record) => {
    if (record.id) {
      await deleteItem({ id: record.id });
      message.success('删除成功！');
      await getData(id.value);
    } else {
      delete editableData[record.key];
      dataSource.value.pop();
    }
  };
  const cancel = (record) => {
    if (!record.id) {
      dataSource.value.pop();
    }
    delete editableData[record.key];
  };

  const visibleChange = (value) => {
    if (!value) {
      activeKey.value = '1';
    }
  };

  const handleDeviceTableChange = async (pagination) => {
    devicePagination.value.pageNo = pagination.current;
    await getData(id.value);
  };

  const open = ref<boolean>(false);

  const targetId = ref('');

  // 打开抽屉
  const showDrawer = async (record) => {
    targetId.value = record.id;
    await getBuildingControlPointList();
    open.value = true;
  };

  interface FormState {
    gatewayAdr: string;
    bacnetAdr: string;
    content: string;
  }

  const formState = reactive<FormState>({
    gatewayAdr: '',
    bacnetAdr: '',
    content: '',
  });

  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
    total: 10,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total) => `共${total}条`,
  });

  const pointColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '网关地址',
      dataIndex: 'gatewayAdr',
      key: 'gatewayAdr',
    },
    {
      title: '通信地址',
      dataIndex: 'bacnetAdr',
      key: 'bacnetAdr',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
    },
    {
      title: '采集时间',
      dataIndex: 'collectionTime',
      key: 'collectionTime',
      width: 240,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 120,
    },
  ];

  const pointData = ref([
    {
      deviceName: '点位名称1',
      categoryId: '点位id1',
      spaceId: '点位路径1',
    },
    {
      deviceName: '点位名称2',
      categoryId: '点位id2',
      spaceId: '点位路径2',
    },
    {
      deviceName: '点位名称3',
      categoryId: '点位id3',
      spaceId: '点位路径3',
    },
    {
      deviceName: '点位名称4',
      categoryId: '点位id4',
      spaceId: '点位路径4',
    },
    {
      deviceName: '点位名称5',
      categoryId: '点位id5',
      spaceId: '点位路径5',
    },
  ]);

  // 获取表格数据
  const getBuildingControlPointList = async () => {
    let params = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
      gatewayAdr: formState.gatewayAdr ? formState.gatewayAdr : undefined,
      bacnetAdr: formState.bacnetAdr ? formState.bacnetAdr : undefined,
      content: formState.content ? formState.content : undefined,
    };
    let res = await getBuildingControlPointListApi(params);
    pointData.value = [...res.records];
    pagination.value.total = res.total;
  };

  const handleTableChange = async (page) => {
    pagination.value.pageNo = page.current;
    await getBuildingControlPointList();
  };

  // 行双击事件
  const rowClick = (record) => {
    return {
      // 双击事件
      ondblclick: (event) => {
        // 在这里处理双击逻辑
        bindPointLocation(record);
      },
    };
  };

  // 绑定点位
  const bindPointLocation = async (record) => {
    let params = {
      pointId: targetId.value,
      gatewayAdr: record.gatewayAdr,
      bacnetAdr: record.bacnetAdr,
    };
    let res = await bindPointLocationApi(params);
    if (!res) message.success('绑定成功！');
    await getData(id.value);
    open.value = false;
  };

  const searchData = () => {
    pagination.value.pageNo = 1;
    getBuildingControlPointList();
  };
</script>

<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100%;
  }

  .custom-hover-table {
    --hover-bg-color: #f0f9ff;
    --active-bg-color: #e6f7ff;
  }

  /* 行 hover 效果 */
  .custom-hover-table :deep(.ant-table-tbody > tr:hover > td) {
    background: var(--hover-bg-color) !important;
  }

  /* 行点击效果 */
  .custom-hover-table :deep(.ant-table-tbody > tr:active > td) {
    background: var(--active-bg-color) !important;
  }

  /* 过渡动画 */
  .custom-hover-table :deep(.ant-table-tbody > tr > td) {
    transition: background-color 0.2s ease;
  }

  .content-box {
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 显示省略号 */
    width: 80px;
  }
</style>
