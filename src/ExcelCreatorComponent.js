import ExcelJS from 'exceljs';

export class ExcelCreatorComponent extends HTMLElement {


  async createExcelFile(extractedContents) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Data');

    // Добавляем заголовки
    const rowData = [
      '(From - To)', 'Hrs', 'Lateral', 'Phase', 'Cat.', 'Major OP', 'Action', 'Object', 'Resp. Co',
      'Hole depth', '', 'Event depth', '', 'Lt Type', 'Lt ID', 'Summary of Operations'
    ];
    const row = worksheet.addRow(rowData);

    const subRowData = [
      '', '', '', '', '', '', '', '', '',
      'Start', 'End', 'Start', 'End', '', '', ''
    ];
    const subRow = worksheet.addRow(subRowData);

    // Объединяем ячейки для заголовков
    worksheet.mergeCells('J1:K1'); // Hole depth
    worksheet.mergeCells('L1:M1'); // Event depth
    worksheet.mergeCells('N1:N2'); // Lt Type
    worksheet.mergeCells('O1:O2'); // Lt ID
    worksheet.mergeCells('P1:P2'); // Summary of Operations

    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'L1', 'N1', 'O1', 'P1'];
    for (const cell of headerCells) {
      worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell(cell).font = { name: 'Arial', size: 10, bold: true };
      worksheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' } // Серый цвет фона
      };
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }


    const subHeaderCells = ['J2', 'K2', 'L2', 'M2'];

    for (const cell of subHeaderCells) {
      worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell(cell).font = { name: 'Arial', size: 10, bold: true };
      worksheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' } // Серый цвет фона
      };
      worksheet.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }


    worksheet.columns = [
      { width: 15 },
      { width: 5 },
      { width: 10 },
      { width: 10 },
      { width: 5 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
      { width: 7 },
      { width: 10 },
      { width: 10 },
      { width: 25 }
    ];


    // Добавляем данные
    for (const content of extractedContents) {
      worksheet.addRow([content]);
    }





    // Сохраняем файл
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted_contents.xlsx';
    link.click();
  }
}

customElements.define('excel-creator', ExcelCreatorComponent);
