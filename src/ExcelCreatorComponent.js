import ExcelJS from 'exceljs';

export class ExcelCreatorComponent extends HTMLElement {


  async createExcelFile(extractedContents) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Data');

    this.addHeaders(worksheet);
    const rows = this.processExtractedContents(extractedContents);
    this.addDataToWorksheet(worksheet, rows);

    await this.saveWorkbook(workbook);
  }

  addHeaders(worksheet) {
    const headerRow = [
      '(From - To)', 'Hrs', 'Lateral', 'Phase', 'Cat.', 'Major OP', 'Action', 'Object', 'Resp. Co',
      'Hole depth', 'Hole depth', 'Event depth', 'Event depth', 'Lt Type', 'Lt ID', 'Summary of Operations'
    ];
    worksheet.addRow(headerRow);

    const subHeaderRow = [
      '', '', '', '', '', '', '', '', '',
      'Start', 'End', 'Start', 'End', '', '', ''
    ];
    worksheet.addRow(subHeaderRow);

    // Merge cells for 'Hole depth' and 'Event depth'
    worksheet.mergeCells('J1:K1');
    worksheet.mergeCells('L1:M1');

    this.formatHeaders(worksheet);
  }

  formatHeaders(worksheet) {
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'L1', 'N1', 'O1', 'P1'];
    for (const cell of headerCells) {
      this.formatCell(worksheet.getCell(cell));
    }

    const subHeaderCells = ['J2', 'K2', 'L2', 'M2'];
    for (const cell of subHeaderCells) {
      this.formatCell(worksheet.getCell(cell));
    }

    worksheet.columns = [
      { width: 15 }, { width: 5 }, { width: 10 }, { width: 10 }, { width: 5 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 7 },
      { width: 7 }, { width: 7 }, { width: 7 }, { width: 10 }, { width: 10 }, { width: 25 }
    ];
  }

  formatCell(cell) {
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' } // Серый цвет фона
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  processExtractedContents(extractedContents) {
    const rows = [];
    let currentRow = [];
    let tempRow = [];

    for (let i = 0; i < extractedContents.length; i++) {
      const item = extractedContents[i];



      // Проверяем паттерн 'число - число'
      if (i + 4 < extractedContents.length &&
        /^\d+$/.test(item) &&
        extractedContents[i + 1].trim() === '' &&
        extractedContents[i + 2].trim() === '-' &&
        extractedContents[i + 3].trim() === '' &&
        /^\d+$/.test(extractedContents[i + 4])) {

        currentRow.push(`${item} - ${extractedContents[i + 4]}`);
        i += 4; // Пропускаем обработанные элементы
        continue;
      }

      if (item === "") {
        if (tempRow.length > 0) {
          const joinedTempRow = tempRow.join('').trim();
          if (joinedTempRow !== '') {
            currentRow.push(joinedTempRow);
          }
          tempRow = [];
        }
        if (currentRow.length > 0) {
          rows.push(currentRow.filter(cell => cell.trim() !== ''));
          currentRow = [];
        }
      } else if (item.trim() === "-" || item.trim() === " ") {
        tempRow.push(item);
      } else {
        if (tempRow.length > 0) {
          const joinedTempRow = tempRow.join('').trim();
          if (joinedTempRow !== '') {
            currentRow.push(joinedTempRow);
          }
          tempRow = [];
        }
        if (item.trim() !== '') {
          currentRow.push(item.trim());
        }
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow.filter(cell => cell.trim() !== ''));
    }

    return rows;
  }

  addDataToWorksheet(worksheet, rows) {
    for (let i = 0; i < rows.length; i++) {
      worksheet.addRow(rows[i]);
    }
  }

  async saveWorkbook(workbook) {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted_contents.xlsx';
    link.click();
  }
}

customElements.define('excel-creator', ExcelCreatorComponent);
