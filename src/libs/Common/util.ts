/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { ToWords } from 'to-words';
import fetch from 'node-fetch';
import * as base64arraybuffer from 'base64-arraybuffer';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { BadRequestException } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import * as process from 'node:process';
export class Util {
  static hashPassword(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, Number(process.env.BcryptHashRound));
  }
  static comparePassword(
    plainPassword: string,
    encryptedPassword: string,
  ): boolean {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  }

  static generatePassword(length = 4): string {
    let password = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()-';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      password += characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }
    return password;
  }
  static getTimeDifference(endTime: Date, startTime: Date): string {
    const diff = endTime.getTime() - startTime.getTime();
    let msec = diff;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    let result = hh ? hh.toString() : '00';
    result += ':' + (mm.toString() ? mm.toString() : '00');
    result += ':' + (ss.toString() ? ss.toString() : '00');
    return result;
  }
  static GenerateToken(user: any, expiresIn = '1d') {
    return jwt.sign(user, process.env.TOKEN_SECRET_KEY, {
      expiresIn: expiresIn,
    });
  }
  static GenerateRefreshToken(user: any, expiresIn = '365d') {
    return jwt.sign(user, process.env.REFRESH_SECRET_TOKEN, {
      expiresIn: expiresIn,
    });
  }
  static compareDate(date1: Date, date2: Date) {
    return date1.getTime() - date2.getTime();
  }
  static readFilesFromFolder(path: string) {
    if (!fs.existsSync(path)) {
      console.log('Folder does not exist');
      return [];
      // fs.mkdirSync(path);
    }
    return fs.readdirSync(path);
  }
  static isFolderExists(path: string) {
    return fs.existsSync(path);
  }
  static deleteFile(path: string) {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
    });
  }
  static numberToWord(num: number | string) {
    if (typeof num === 'string') num = parseFloat(num);
    const toWords = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
        currency: false,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
          // can be used to override defaults for the selected locale
          name: 'Birr',
          plural: 'Birr',
          symbol: 'ብር',
          fractionalUnit: {
            name: 'Santim',
            plural: 'Santim',
            symbol: '',
          },
        },
      },
    });
    const fixedNumber = toWords.toFixed(num, 2);
    return toWords.convert(fixedNumber);
  }
  static excelDateToJSDate(date) {
    return new Date(Math.round((date - 25569) * 86400 * 1000));
  }
  static removeSpecialCharacters(str: string) {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
  }
  static async convertToBase64FromUrl(fileUrl: string) {
    const arrayBuffer = await fetch(fileUrl).then((res) => res.arrayBuffer());
    const base64 = base64arraybuffer.encode(arrayBuffer);
    let mimeType = 'image/png';
    if (fileUrl.includes('.jpg')) {
      mimeType = 'image/jpg';
    } else if (fileUrl.includes('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (fileUrl.includes('.svg')) {
      mimeType = 'image/svg+xml';
    }
    return `data:${mimeType};base64,${base64}`;
  }
  static dateFormat(date: Date, timeZone = null) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    if (timeZone) options.timeZone = timeZone;
    return date.toLocaleDateString('en-US', options);
  }
  static addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  static addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
  static addYears(date: Date, years: number) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }
  static addHours(date: Date, hours: number) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }
  static addWeeks(date: Date, weeks: number) {
    const result = new Date(date);
    const days = weeks * 7;
    result.setDate(result.getDate() + days);
    return result;
  }
  static standardizePhoneNumber(
    phoneNumber: string,
    defaultCountryCode = 'ET',
  ) {
    const parsed = parsePhoneNumberFromString(
      phoneNumber,
      defaultCountryCode as CountryCode,
    );
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164'); // Output in +<CountryCode><PhoneNumber>
    }
    throw new BadRequestException('Invalid Phone format');
  }
  static isStandardPhoneNumber(phoneNumber: string, defaultCountryCode = 'ET') {
    const parsed = parsePhoneNumberFromString(
      phoneNumber,
      defaultCountryCode as CountryCode,
    );
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164'); // Output in +<CountryCode><PhoneNumber>
    }
    return null;
  }

  static maskPhoneNumber(phoneNumber: string) {
    phoneNumber = this.standardizePhoneNumber(phoneNumber);
    const length = phoneNumber.length;
    const visibleStartDigits = 6;
    const visibleEndDigits = 2;
    const start = phoneNumber.slice(0, visibleStartDigits);
    const end = phoneNumber.slice(-visibleEndDigits);
    const masked = '*'.repeat(length - (visibleStartDigits + visibleEndDigits));

    return `${start}${masked}${end}`;
  }
  static partialPhoneNumber(phoneNumber: string) {
    phoneNumber = this.standardizePhoneNumber(phoneNumber);
    const visibleStartDigits = 9;
    const start = phoneNumber.slice(0, visibleStartDigits);

    return `${start}`;
  }

  // reference-generator
  static generateReference({
    // identifier = '',
    prefix = '',
    digits = 0,
    increment = 1,
    currentNumber = 0,
    suffix = '',
  }: {
    identifier?: string;
    prefix?: string;
    digits?: number;
    increment?: number;
    currentNumber?: number;
    suffix?: string;
  }): string {
    const nextNumber = Number(currentNumber) + Number(increment);

    const formattedNumber = nextNumber.toString().padStart(digits, '0');

    const now = new Date();

    const year = now.getFullYear();
    const shortYear = year % 100;
    const weekOfYear = Math.ceil(
      (now.getDate() + new Date(year, 0, 0).getDay()) / 7,
    );
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const dayOfYear = Math.ceil(
      (now.getTime() - new Date(year, 0, 0).getTime()) / 86400000,
    );

    // Define date keywords
    const dateKeywords = {
      '{year}': year,
      '{shortYear}': String(shortYear).padStart(2, '0'),
      '{month}': String(now.getMonth() + 1).padStart(2, '0'),
      '{day}': String(now.getDate()).padStart(2, '0'),
      '{hour}': String(now.getHours()).padStart(2, '0'),
      '{minute}': String(now.getMinutes()).padStart(2, '0'),
      '{second}': String(now.getSeconds()).padStart(2, '0'),
      '{dayOfYear}': String(dayOfYear).padStart(3, '0'),
      '{weekOfYear}': String(weekOfYear).padStart(2, '0'),
      '{dayOfWeek}': dayOfWeek,
    };

    const formattedPrefix = Object.keys(dateKeywords).reduce(
      (str, key) => str.replace(new RegExp(key, 'g'), dateKeywords[key]),
      prefix,
    );

    const formattedSuffix = Object.keys(dateKeywords).reduce(
      (str, key) => str.replace(new RegExp(key, 'g'), dateKeywords[key]),
      suffix,
    );

    return `${formattedPrefix}${formattedNumber}${formattedSuffix}`;
  }

  static replacePlaceholders = (
    query: string,
    data: Record<string, any>,
  ): string => {
    return query.replace(/\$\{(\w+)\}/g, (_, key) => data[key] || '');
  };
}

export const getMimeType = (extension: string) => {
  switch (extension.toLocaleLowerCase()) {
    case 'jpg': {
      return 'image/jpg';
    }
    case 'png': {
      return 'image/png';
    }
    case 'jpeg': {
      return 'image/jpeg';
    }
    case 'pdf': {
      return 'application/pdf';
    }
    default:
      throw new Error(`Unknown Extension ${extension}`);
  }
};
