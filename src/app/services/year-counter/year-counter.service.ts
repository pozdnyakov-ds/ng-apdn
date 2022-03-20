import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YearCounterService {

  private obustrData: [][];
  private oborData: [][];

  constructor() {}

  public calculationInit(obustrData: [][], oborData: [][] ): void {
    this.obustrData = obustrData;
    this.oborData = oborData;
  }

  /**
   * Расчет лет для кап вложения обустройтсва
   * @param data
   */
  public obustr(): any[][] {
    return this.yearCalculation(this.obustrData);
  }

  /**
   * Расчет лет для кап вложений оборудование
   * @param data
   */
  public obor(): any[][] {
    // return [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16]];
    return this.yearCalculation(this.oborData);
  }

  public obustrFull(): any[][] {
    // @ts-ignore
    return [[this.summ(this.yearCalculation(this.obustrData)[0])]];
  }

  public oborFull(): any[][] {
    // @ts-ignore
    return [[this.summ(this.yearCalculation(this.oborData)[0])]];
  }

  calculationObor(obor2d: [][]): void {
    this.oborData = obor2d;
  }

  calculationObustr(obustr2d: [][]): void {
    this.obustrData = obustr2d;
  }

  private yearCalculation(data: [any][any]): any[][] {
    // Учитывать, Значение, Срок, Год расчета
    // 2,         3,        4,    5
    const rez = [];
    data.forEach((rows, rowIndex) => {
      if (rowIndex > 0 && rowIndex < data.length - 2) { // Заголовки и строки ИТОГО в конце игнорируются
        // Если стоит "учитывать" - считаем, иначе -> заполняем нулями
        if (parseInt(data[rowIndex][2], 10) === 1) {
          // rows.forEach((col, colIndex) => {
          //
          // });
          const newRow = [];
          for (let i = 0; i < 16; i++) {
            if (i === 0) { // Для первого столбца
              // Расчет для первого столбца
              if (this.isCalcYear(data, rowIndex, i)) {
                const znach = parseFloat(data[rowIndex][3]);
                const srok = parseFloat(data[rowIndex][4]);
                // = Значение* (12 / срок)
                newRow.push(znach * (12 / srok));
              } else {
                newRow.push(0);
              }
            } else { // Расчет для второго столбца
              if (this.isCalcYear(data, rowIndex, i)) {
                const summ = newRow.reduce((pr, cur) => pr + cur);  // сумма всех предыдущих значений
                const znach = parseFloat(data[rowIndex][3]);
                const srok = parseFloat(data[rowIndex][4]);
                // // = Значение* (12 / срок)
                if (summ + znach * (12 / srok) < znach) {
                  newRow.push(znach * (12 / srok));
                } else {
                  newRow.push(znach - summ);
                }
              } else {
                newRow.push(0);
              }
            }
          }
          // console.log(newRow);
          rez.push(newRow);
        } else {
          const newRow = [];
          for (let i = 0; i < 16; i++) {
            newRow.push(0);
          }
          rez.push(newRow);
        }
      }
    });

    // console.log({rez});

    const singleRow = [];
    // rez.forEach(rows => {
    //   rows.forEach((cols, indexX) => {
    //     if (singleRow[indexX]) {
    //       singleRow[indexX] = this.roundTo2Fix(cols / 1000 + singleRow[indexX]);
    //     } else {
    //       singleRow[indexX] =  this.roundTo2Fix(cols / 1000);
    //     }
    //   });
    // });
    rez.forEach(rows => {
      rows.forEach((cols, indexX) => {
        if (singleRow[indexX]) {
          singleRow[indexX] = cols + singleRow[indexX];
        } else {
          singleRow[indexX] =  cols;
        }
      });
    });
    singleRow.forEach((cols, indexX) => {
      singleRow[indexX] =  this.roundTo2Fix(cols / 1000);
    });
    return [singleRow];
  }

  /**
   * Подпадает ли текуйщи год под год расчета
   * @param data      объект с данными
   * @param rowIndex  индекс текуйщей строки
   * @param i         индекс года
   * @private
   */
  private isCalcYear(data: any, rowIndex, i: number): boolean {
    return parseFloat(data[rowIndex][5]) <= (i + 1);
  }

  /**
   * расчет суммы
   * @param arr массив для подсчета суммы
   * @private
   */
  private summ(arr: []): number {
    // @ts-ignore
    return arr.reduce((pr, cur) => pr + cur);
  }

  /**
   * Округление до второго знака
   * @param num значение для округления
   * @private
   */
  private roundTo2Fix(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
