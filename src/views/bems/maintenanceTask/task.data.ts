import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
    {
        title: '任务名称',
        dataIndex: 'taskName',
        align: 'center',
    },
    {
        title: '部门',
        dataIndex: 'department',
        align: 'center',
    },
    {
        title: '执行人',
        dataIndex: 'executorName',
        align: 'center',
    },
    {
        title: '任务开始时间',
        dataIndex: 'plannedStartTime',
        align: "center",
    },
    {
        title: '任务结束时间',
        dataIndex: 'plannedEndTime',
        align: 'center',
    },
    {
        title: '状态',
        dataIndex: 'status',
        align: "center",
    },
];
