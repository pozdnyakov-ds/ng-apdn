import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YearCounter141Service {

  constructor() {
  }

  /**
   * Расчет амторизационных отчилсений для 14.1
   * @param amortMonth срок амортизации по месяцам
   * @param burCount  стоимость бурения
   */
  public calculate14(amortMonth: number, burCount: number): any [][] {
    const rez = [];
    // const burCount000 = burCount * 1000;
    const burCount000 = burCount;
    for (let i = 0; i < 16; i++) {
      if (i === 0) { // первый столбец
        // rez.push(burCount000 * (12 / amortMonth));
        rez.push(this.roundTo2Fix(burCount000 * 12 / amortMonth));
      } else {
        const summ = rez.reduce((previousValue, currentValue) => previousValue + currentValue);
        // const stepCalc = burCount000 * (12 / amortMonth);
        const stepCalc = this.roundTo2Fix(burCount000 * 12 / amortMonth);
        if (summ + stepCalc < burCount000) {
          rez.push(stepCalc);
        } else {
          rez.push(burCount000 - summ);
        }
      }
    }
    return [rez];
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
