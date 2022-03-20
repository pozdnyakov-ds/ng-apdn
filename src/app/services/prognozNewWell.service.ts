import { Injectable, Input } from '@angular/core';
import { MainUtilsService } from 'main-utils';
// import { toXML } from 'jstoxml';

const PORTLET_ID = 'APDN_SERV';

/**Фактические показатели */
export interface Point {
  /**удельные запасы нефти на скважину  */
  z_oil: number;
  /**дебит жидкости */
  q_liq: number;
  /**Начальная обводненность  */
  f0: number;
  /** коэффициент эксплуатации скважины  */
  k_expl: number;
  /**месяц ввода скважины  */
  t1: number;
}

export interface Coeff {
  a: number;
  b: number;
}

/**Максимальная обводненность */
const maxLiq = 0.98;

const timemonth = 30.4;

@Injectable({
  providedIn: 'root',
})
export class PrognozServiceNewWell {
  startData: Point[];
  coeff: Coeff;
  /**число дней в месяцах */
  constructor(private mainUtils: MainUtilsService) {
    this.startData = [
      {
        z_oil: 35000,
        q_liq: 12,
        f0: 5,
        k_expl: 0.95,
        //t1:new Date().toLocaleDateString()
        t1: 1,
      },
    ];
  }

  /**
   * Получить список параметров по скважине
   * @param pwell_id - идентификатор скважины (скважина 11106 - 102877)
   * @param phor_codes - список кодов горизонтов через запятую (444,450,480...)
   * @param pdate_beg - дата начала (формат dd.mm.yyyy)
   * @param pdate_end - дата окончания (формат dd.mm.yyyy)
   */
  async getData(pwell_id: string, org_code: string, pfield_code: string): Promise<Array<any>> {
    const WEB_PART = 'APDN_DATA_FOR_PROGN_NEW_WELL';
    /*
    const restParams = [{ paramName: 'pwell_id', paramValue: pwell_id },
    { paramName: 'phor_codes', paramValue: phor_codes },
    { paramName: 'pdate_beg', paramValue: pdate_beg },
    { paramName: 'pdate_end', paramValue: pdate_end },];
*/
    const restParams = [
      { paramName: 'phor_codes', paramValue: org_code },
      { paramName: 'pfield_code', paramValue: pfield_code },
      { paramName: 'pwell_id', paramValue: pwell_id },
    ];
    const data = await this.mainUtils.data(PORTLET_ID, WEB_PART, restParams);

    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /** Запуск прогноза для выбранной скважины
   * @param pwell_id - id выбранной скважины
   * @param phor_codes - коды объектов эксплуатации через ,
   */
  async run(pwell_id: string, phor_codes: string, pfield_code: string) {
    console.log('Запущен прогноз');

    this.startData = [];

    //const inputData = this.startData[0];

    // >>
    const inputData = await this.getData(pwell_id, phor_codes, pfield_code);
    if (inputData) {
      inputData.forEach(item => {
        this.startData.push({
          z_oil: Number(item.SPEC_STOCKS),
          q_liq: Number(item.DEBIT_WATER),
          f0: Number(item.BEG_PERC_WATER),
          k_expl: Number(item.CF_EXPL_WELL),
          //t1:new Date().toLocaleDateString()
          t1: 1,
        });
      } )
    }
    // <<

    console.log(this.startData);
    let pr;
    /**Определения варианта расчета */
    if (this.startData[0].f0 / 100 > 0 && this.startData[0].f0 / 100 < 0.5) {
      this.coeff = this.approximation(this.startData[0]);
      pr = this.prognoz();
    }
    // if(inputData.f0===0)
    // if(inputData.f0>=0.5
    return pr;
  }
  prognoz(): any {
    //первый год если f0=1
    let result = [];
    let k = 0;
    let f = 0;
    let t = this.startData[0].t1;
    let qLiq = this.startData[0].q_liq;
    let prodLiq = this.startData[0].k_expl * timemonth * qLiq;
    let prodLiqSumm = 0;
    let prod_oilSumm = 0;
    while (k < 192 && f <= 0.98) {
      k++;
      prodLiqSumm = prodLiqSumm + prodLiq;
      f = 1 - 1 / (1 + Math.exp(this.coeff.a * (prodLiqSumm - this.coeff.b)));
      const q_oil = qLiq * (1 - f);
      const prod_oil = prodLiq * (1 - f);
      prod_oilSumm = prod_oilSumm + prod_oil;
      const qoil_cum = prod_oilSumm;

      result.push({
        k: k,
        t: t,
        q_liq: qLiq,
        prodLiq: prodLiq,
        Qliqcum: prodLiqSumm,
        f: f * 100,
        q_oil: q_oil,
        prod_oil: prod_oil,
        qoil_cum: qoil_cum,
      });
      t++;
      if (t == 13) t = 1;
    }
    console.log('RESULT');
    console.log(result);
    var resultByYears = [];
    let year = 1;
    let resultYearPrev;
    for (let i = 0; i < result.length; i++) {
      if (resultByYears.length == 0 && result[i].t === 12) {
        resultYearPrev = result[i].qoil_cum;
        resultByYears.push({ year: 1, prodoil: result[i].qoil_cum });
        year = year + 1;
      } else if (result[i].t === 12) {
        const oilcum_prev = resultYearPrev;
        resultYearPrev = result[i].qoil_cum;
        resultByYears.push({
          year: year,
          prodoil: resultYearPrev - oilcum_prev,
        });
        year = year + 1;
      }
    }

    console.log(
      'В интерфейсе выводится с текущего года включительно 16 лет на прогноз, для сверки вывожу в консоль весь массив факт и прогноз'
    );
    console.log(resultByYears);
    return resultByYears;
  }

  /**Функция обводненности преобразованная*/
  liqFunction(f: number): number {
    let result = Math.log(f / (1 - f));
    return result;
  }

  /** Этап1-Аппроксимация
   * @param data - массив точек с основными показателями
   * @returns объект коэффициентов a,b
   */
  approximation(data: Point): Coeff {
    var result = { a: null, b: null };
    result.a = -(1 / data.z_oil) * this.liqFunction(data.f0 / 100);
    result.b = data.z_oil;
    return result;
  }
}
