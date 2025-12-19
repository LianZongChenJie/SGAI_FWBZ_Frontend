import FileSaver from 'file-saver'
import * as XLSX from 'xlsx';

export function exportExcel({ tableData, headers, fileName = '导出数据', excludeFields = [] }) {
  // 过滤要排除的字段
  const filteredHeaders = headers.filter(header => !excludeFields.includes(header.key))

  // 准备表头数据
  const headerData = [filteredHeaders.map(header => header.title)]

  // 准备表格数据
  const bodyData = tableData.map(row => {
    return filteredHeaders.map(header => {
      let value = row[header.key]

      // 处理特殊数据类型
      if (header.formatter) {
        value = header.formatter(value, row)
      }

      // 处理空值
      if (value === null || value === undefined) {
        return ''
      }

      return value
    })
  })

  // 合并表头和表格数据
  const exportData = [...headerData, ...bodyData]

  // 创建工作簿
  const ws = XLSX.utils.aoa_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // 设置列宽
  const colWidths = filteredHeaders.map(header => ({
    wch: header.width || Math.max(header.title.length, 10)
  }))
  ws['!cols'] = colWidths

  // 导出文件
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  FileSaver.saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`)
}

/**
 * 从el-table DOM元素导出（适用于复杂表格）
 */
export function exportTableToExcel(tableId, fileName = '表格数据') {
  const table = document.getElementById(tableId)
  if (!table) {
    console.error('表格元素未找到')
    return
  }

  // 克隆表格以避免影响页面显示
  const tableClone = table.cloneNode(true)

  // 处理Element UI固定列
  const fixedElement = tableClone.querySelector('.el-table__fixed')
  if (fixedElement) {
    fixedElement.parentNode.removeChild(fixedElement)
  }

  const wb = XLSX.utils.table_to_book(tableClone, { raw: true })
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  FileSaver.saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`)
}