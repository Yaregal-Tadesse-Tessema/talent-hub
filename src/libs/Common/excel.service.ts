/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelGenerator {
  private readonly workbook = new ExcelJS.Workbook();
  constructor() {
    this.workbook.creator = 'Admin User';
    this.workbook.lastModifiedBy = 'Admin User';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastPrinted = new Date();
    this.workbook.properties.date1904 = true;
  }
  async addWorksheet(sheetName: string, pageConfig = null) {
    if (pageConfig) return this.workbook.addWorksheet(sheetName, pageConfig);
    return this.workbook.addWorksheet(sheetName);
  }
  async addBackgroundImage(worksheet: ExcelJS.Worksheet, image: number) {
    worksheet.addBackgroundImage(image);
  }
  async addRow(worksheet: ExcelJS.Worksheet, row: any[] | any) {
    return worksheet.addRow(row);
  }
  async addColumn(
    worksheet: ExcelJS.Worksheet,
    column: Array<Partial<ExcelJS.Column>>,
  ) {
    worksheet.columns = column;
  }
  async addFooter(worksheet: ExcelJS.Worksheet, footer: string) {
    worksheet.headerFooter.oddFooter = footer;
  }
  async getTotalRows(worksheet: ExcelJS.Worksheet) {
    return worksheet.rowCount;
  }
  async getTotalColumns(worksheet: ExcelJS.Worksheet) {
    return worksheet.columnCount;
  }
  async addTable(worksheet: ExcelJS.Worksheet, table: ExcelJS.TableProperties) {
    return worksheet.addTable(table);
  }
  async addImage(worksheet: ExcelJS.Worksheet, image: number, range: any) {
    worksheet.addImage(image, range);
  }
  async addWorkbookImage(image: string, extension: 'jpeg' | 'png' | 'gif') {
    return this.workbook.addImage({
      base64: image,
      extension,
    });
  }
  async saveFile(fileName: string) {
    await this.workbook.csv.writeFile(fileName);
  }
  async saveBuffer(): Promise<Buffer> {
    const buffer = await this.workbook.csv.writeBuffer();
    return Buffer.from(buffer) as Buffer;
  }
}
