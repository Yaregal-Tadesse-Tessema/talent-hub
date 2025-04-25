/* eslint-disable prettier/prettier */
import Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Util } from './util';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
Handlebars.registerHelper('length', function (arr) {
  return arr.length;
});
Handlebars.registerHelper('dateFormat', (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
});
Handlebars.registerHelper('numberFormat', (num: number | string) => {
  if (!num) {
    return '';
  }
  if (typeof num === 'string') num = parseFloat(num);
  num = num.toFixed(2);
  return parseFloat(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});
Handlebars.registerHelper('ifEquals', (arg1: string, arg2: string) => {
  return arg1.toLowerCase() === arg2.toLowerCase();
});
Handlebars.registerHelper('ifNotEquals', (arg1: string, arg2: string) => {
  return arg1.toLowerCase() !== arg2.toLowerCase();
});
Handlebars.registerHelper('absoluteNumberFormat', (num: number | string) => {
  if (!num) {
    return '';
  }
  if (typeof num === 'string') num = parseFloat(num);
  num = parseFloat(num.toFixed(2));
  if (num < 0) {
    const positiveNum = num * -1.0;
    return `(${positiveNum.toLocaleString('en-US')})`;
  } else return num.toLocaleString('en-US');
});
Handlebars.registerHelper('numberIncrement', (num: string | number) => {
  if (typeof num === 'string') num = parseInt(num);
  return num + 1;
});
Handlebars.registerHelper('subtract', (num1, num2) => {
  return (parseFloat(num1) - parseFloat(num2)).toFixed(2);
});
Handlebars.registerHelper('numberToWord', (num) => {
  return Util.numberToWord(num);
});

Handlebars.registerHelper('eq', (a, b) => {
  return a === b;
});
Handlebars.registerHelper('gt', (a, b) => {
  console.log(a, b);
  return a > b;
});
Handlebars.registerHelper('gte', (a, b) => {
  return a >= b;
});
Handlebars.registerHelper('lt', (a, b) => {
  return a < b;
});
Handlebars.registerHelper('lte', (a, b) => {
  return a <= b;
});
Handlebars.registerHelper('ne', (a, b) => {
  return a !== b;
});
Handlebars.registerHelper(
  'getNetSalary',
  function (employeePayrolls, employeeId) {
    const payroll = employeePayrolls.find(
      (payroll: any) => payroll.employeeId === employeeId,
    );
    return payroll ? payroll.netSalary : 0;
  },
);

export class HandlebarEngine {
  static async compile(template: string, data: object): Promise<string> {
     const filePath = path.join(
      process.cwd(),
      '/src/templates',
      `${template}.hbs`,
    );
    const html = await fs.readFile(filePath, 'utf8');
  const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars);
    return insecureHandlebars.compile(html)(data);
  }
}
