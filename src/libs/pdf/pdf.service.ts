/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { HandlebarEngine } from '../Common/handlebar.engine';

@Injectable()
export class PdfService {
  async generatePdf(
    data: object,
    templateName: string,
    fileName = null,
    options = null,
    profilePicture?: string,
  ): Promise<string> {
    const defaultOptions = {
      format: 'A4',
      displayHeaderFooter: true,
      landscape: false,
      margin: {
        top: '150px',
        bottom: '200px',
        right: '50px',
        left: '71px',
      },
    };
    if (!options) {
      options = Object.assign({}, defaultOptions, options);
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    const content = await HandlebarEngine.compile(templateName, data);
    await page.setContent(content, { waitUntil: 'load', timeout: 0 });
    if (fileName === null) {
      fileName = `${new Date().getTime()}`;
    }
    options.displayHeaderFooter = true;

    // Set header template with the logo
    // options.headerTemplate = `
    //   <div style="width: 100%; text-align: center; margin-top: 20px;">
    //     <img src="${logoUrl}" alt="Company Logo" style="max-width: 100px; height: auto;" />
    //   </div>
    // `;
    options.headerTemplate = `<div></div>`;
    options.footerTemplate = `<div style="display:flex; justify-content:center; align-items:center; gap:6px; width:100%; font-size:10px!important;color:gray!important; text-align: right !important; background:red !important;">
      <span>Page: </span><span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`;
    const targetPath = '/tmp/';
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
    await page.pdf(
      Object.assign(
        {
          path: `${targetPath}/${fileName}.pdf`,
          printBackground: true,
          timeout: 0,
        },
        options,
      ),
    );
    console.log('done creating pdf');
    await browser.close();
    return `${fileName}.pdf`;
  }
}
