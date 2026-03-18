import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Auto-size columns
  const maxWidth = 30;
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(maxLen + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function flattenForExport(items: any[], fields: { key: string; label: string; transform?: (val: any, item: any) => any }[]) {
  return items.map((item) => {
    const row: Record<string, any> = {};
    for (const field of fields) {
      const val = field.key.split('.').reduce((obj, k) => obj?.[k], item);
      row[field.label] = field.transform ? field.transform(val, item) : (val ?? '');
    }
    return row;
  });
}
