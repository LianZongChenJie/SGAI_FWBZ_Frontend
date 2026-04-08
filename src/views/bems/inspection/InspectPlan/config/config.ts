export const recurSpaceName = (data: any[], id: string): any => {
  return data.map(item => {
    if (item.id == id) {
      return item;
    } else {
      if (item.childrens && item.childrens.length) {
        let res = recurSpaceName(item.childrens, id);
        if (res) {
          return res;
        }
      }
    }
  });
};

export const recurDataProce = (data: any[]): any[] => {
  data = data.flat(Infinity);
  let arr: any[] = [];
  data.forEach(item => {
    if (item !== undefined) {
      arr.push(item);
    }
  });
  arr[0].fullNamePath = arr[0].fullNamePath;
  return arr;
};

export const ProcessingEchoDate = (data: string): string[][] => {
  const sub_strings = data.split(',');
  const result: string[][] = [];
  sub_strings.forEach(sub_string => {
    const regex = /(\d+月)(\d+日)/;
    const [_, month, day] = regex.exec(sub_string);
    result.push([month, day]);
  });
  return result;
};

export const ProcessingDay = (data: string): string[][] => {
  let splitData = data.split(',');
  let DayArray: string[][] = [];
  splitData.forEach(item => {
    DayArray.push([item]);
  });
  return DayArray;
};
