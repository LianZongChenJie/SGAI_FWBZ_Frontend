/**
 * 递归查找空间节点
 * @param data 空间树数据
 * @param id 要查找的空间ID
 * @returns 找到的空间节点或undefined
 */
export const recurSpaceName = (data: any[], id: string): any | undefined => {
  for (const item of data) {
    if (item.id == id) {
      return item;
    }
    if (item.childrens && item.childrens.length) {
      const res = recurSpaceName(item.childrens, id);
      if (res) {
        return res;
      }
    }
  }
  return undefined;
};

/**
 * 处理递归数据，展平数组并过滤undefined
 * @param data 递归数据
 * @returns 处理后的数组
 */
export const recurDataProce = (data: any[]): any[] => {
  data = data.flat(Infinity);
  let arr: any[] = [];
  data.forEach(item => {
    if (item !== undefined) {
      arr.push(item);
    }
  });
  return arr;
};

/**
 * 处理回显日期（年月日格式）
 * @param data 日期字符串，格式如 "1月1日,2月3日"
 * @returns 二维数组，如 [["1月", "1日"], ["2月", "3日"]]
 */
export const ProcessingEchoDate = (data: string): string[][] => {
  if (!data) return [];
  const sub_strings = data.split(',');
  const result: string[][] = [];
  sub_strings.forEach(sub_string => {
    const regex = /(\d+月)(\d+日)/;
    const match = regex.exec(sub_string);
    if (match) {
      const [_, month, day] = match;
      result.push([month, day]);
    }
  });
  return result;
};

/**
 * 处理回显日期（其他格式）
 * @param data 日期字符串，逗号分隔
 * @returns 二维数组，每个元素包装为单元素数组
 */
export const ProcessingDay = (data: string): string[][] => {
  if (!data) return [];
  let splitData = data.split(',');
  let DayArray: string[][] = [];
  splitData.forEach(item => {
    DayArray.push([item]);
  });
  return DayArray;
};
// 强制触发 git 变更检测
