import { Injectable } from '@angular/core';
import { MainUtilsService } from 'main-utils';
import { toXML } from 'jstoxml';

const PORTLET_ID = 'APDN_SERV';

/**Фактические показатели */
export interface Point {
  /**год */
  t: number;
  /**дебит нефти */
  qoil?: number;
  /**дебит жидкости */
  qliq?: number;
  /**обводненность в %. */
  ffact?: number;
  /**время работы */
  timeprod?: number;
  /**добыча нефти */
  prodoil: number;
  /**добыча жидкости */
  prodliq?: number;
  /**накопленная добыча нефти */
  qoilcum?: number;
  /**накопленная добыча жидкости с начала эксплуатаци */
  qliqcum?: number;
  /**обводненность расчетная */
  qappliq?: number;
  /**дебит нефти расчетный */
  qappoil?: number;
  /**добыча нефти расчетная */
  prodappoil?: number;
  /**накопленная добыча нефти расчетная */
  qappoilcum?: number;
  /**Дата отчетного периода */
  dateop?: Date;
}

export interface Coeff {
  a: number;
  b: number;
}

export interface ErrCriteria {
  conditionA: boolean,
  conditionCrA: boolean,
  conditionCrB: boolean
}

export interface OptimalKoef {
  aopt: number,
  bopt: number
}

const standartA = 0.05;//0.1;//
const standartB = 0.03;//0.1;//
/**Коэффициент эксплуатации скважин */
const kexp = 0.95;
/**Максимальная обводненность */
const maxLiq = 0.98;
/**Макисмальный период прогноза */
const Npr = 16;

@Injectable({
  providedIn: 'root'
})
export class PrognozService {
  /** признак Исключить выполнение условия по CrB */
  avoidCrB: boolean;

  startData: Point[];
  coeff: Coeff;

  constructor(private mainUtils: MainUtilsService) {
    // this.startData = [
    //   { t: 2000, ffact: 14.02, qliq: 4.69, qoil: 4.032, timeprod: 7994, prodoil: 1343, prodliq: 1562, qliqcum: 1562, qoilcum: 1343 },
    //   { t: 2001, ffact: 8.7, qliq: 6.847, qoil: 6.251, timeprod: 7974, prodoil: 2077, prodliq: 2275, qliqcum: 3837, qoilcum: 3420 },
    //   { t: 2002, ffact: 8.65, qliq: 4.752, qoil: 4.341, timeprod: 8353, prodoil: 1511, prodliq: 1654, qliqcum: 5491, qoilcum: 4931 },
    //   { t: 2003, ffact: 9.11, qliq: 4.495, qoil: 4.086, timeprod: 8676, prodoil: 1477, prodliq: 1625, qliqcum: 7116, qoilcum: 6408 },
    //   { t: 2004, ffact: 9.74, qliq: 4.231, qoil: 3.819, timeprod: 7919, prodoil: 1260, prodliq: 1396, qliqcum: 8512, qoilcum: 7668 },
    //   { t: 2005, ffact: 12.27, qliq: 4.187, qoil: 3.673, timeprod: 8265, prodoil: 1265, prodliq: 1442, qliqcum: 9954, qoilcum: 8933 },
    //   { t: 2006, ffact: 12.7, qliq: 3.753, qoil: 3.277, timeprod: 8760, prodoil: 1196, prodliq: 1370, qliqcum: 11324, qoilcum: 10129 },
    //   { t: 2007, ffact: 9.23, qliq: 3.267, qoil: 2.966, timeprod: 8278, prodoil: 1023, prodliq: 1127, qliqcum: 12451, qoilcum: 11152 },
    //   { t: 2008, ffact: 11.43, qliq: 2.827, qoil: 2.504, timeprod: 8100, prodoil: 845, prodliq: 954, qliqcum: 13405, qoilcum: 11997 },
    //   { t: 2009, ffact: 6.59, qliq: 2.742, qoil: 2.562, timeprod: 8760, prodoil: 935, prodliq: 1001, qliqcum: 14406, qoilcum: 12932 },
    //   { t: 2010, ffact: 14.43, qliq: 3.198, qoil: 2.736, timeprod: 8376, prodoil: 955, prodliq: 1116, qliqcum: 15522, qoilcum: 13887 },
    //   { t: 2011, ffact: 20.26, qliq: 3.198, qoil: 2.55, timeprod: 8592, prodoil: 913, prodliq: 1145, qliqcum: 16667, qoilcum: 14800 },
    //   { t: 2012, ffact: 11.03, qliq: 2.509, qoil: 2.232, timeprod: 8064, prodoil: 750, prodliq: 843, qliqcum: 17510, qoilcum: 15550 },
    //   { t: 2013, ffact: 30.29, qliq: 2.704, qoil: 1.885, timeprod: 8760, prodoil: 688, prodliq: 987, qliqcum: 18497, qoilcum: 16238 },
    //   { t: 2014, ffact: 40.64, qliq: 3.33, qoil: 1.976, timeprod: 8743, prodoil: 720, prodliq: 1213, qliqcum: 19710, qoilcum: 16958 },
    //   { t: 2015, ffact: 40.02, qliq: 3.211, qoil: 1.926, timeprod: 8722, prodoil: 700, prodliq: 1167, qliqcum: 20877, qoilcum: 17658 },
    //   { t: 2016, ffact: 28.56, qliq: 3.436, qoil: 2.455, timeprod: 8780, prodoil: 898, prodliq: 1257, qliqcum: 22134, qoilcum: 18556 },
    //   { t: 2017, ffact: 19.31, qliq: 3.425, qoil: 2.764, timeprod: 8745, prodoil: 1007, prodliq: 1248, qliqcum: 23382, qoilcum: 19563 },
    //   { t: 2018, ffact: 19.68, qliq: 3.549, qoil: 2.85, timeprod: 8521, prodoil: 1012, prodliq: 1260, qliqcum: 24642, qoilcum: 20575 },
    //   { t: 2019, ffact: 23.15, qliq: 3.342, qoil: 2.569, timeprod: 8741, prodoil: 935.51, prodliq: 1217.26, qliqcum: 25859.26, qoilcum: 21511 },
    //   { t: 2020, ffact: 25.97, qliq: 3.52, qoil: 2.606, timeprod: 6564, prodoil: 712.77, prodliq: 962.83, qliqcum: 26822.08, qoilcum: 22223 }];
  }

  /** Запуск прогноза для выбранной скважины
   * @param pwell_id - id выбранной скважины
   * @param phor_codes - коды объектов эксплуатации через ,
   * @param pdate_beg - дата начала, по умолчанию '01.01.1900'
   * @param pdate_end - дата окончания, по умолчанию '01.01.3000'
   */
  async run(pwell_id: string, phor_codes: string, pdate_beg: string, pdate_end: string) {
    console.log("Запущен прогноз");
    if (!pdate_beg) { pdate_beg = '01.01.1900'; }
    if (!pdate_end) { pdate_end = '01.01.3000'; }
    this.startData = [];
    const inputData = await this.getData(pwell_id, phor_codes, pdate_beg, pdate_end);
    if (inputData) {
      this.dataArrayToString(inputData);
      inputData.forEach(item => this.startData.push({
        t: (new Date(item.DATE_OP)).getFullYear(),
        qoil: Number(item.DEB_OIL),
        qliq: Number(item.DEB_GIDK),
        ffact: Number(item.OBV),
        timeprod: Number(item.TIME_WORK),
        prodoil: Number(item.OIL),
        prodliq: Number(item.GIDK),
        qoilcum: Number(item.NOIL),
        qliqcum: Number(item.NGIDK),
        dateop: new Date(item.DATE_OP)
      }));
    }
    // console.log(this.startData);
    this.coeff = this.approximation(this.startData);
    var period = this.basePeriodDefinition(this.startData, this.coeff.a, this.coeff.b);
    if (period) {
      var optKoef = this.optimization(this.startData, this.coeff.a, this.coeff.b, 0.5);
      var Npr_com = 16*12; //this.numberOfMonthsBetween(this.startData[0].dateop, this.startData[this.startData.length - 1].dateop);  //MegaTest2
      var pr = this.prognoz(this.startData, kexp, maxLiq, (Npr_com) ? Npr_com : Npr, optKoef.aopt, optKoef.bopt);
      return pr;
    }
    return null;
  }

  dataArrayToString(arr){
    /* CODE_EXT: "102"
    CODE_ORG: "804"
    DATE_OP: "2002-09-01 00:00:00.0"
    DEB_GIDK: "3.49"
    DEB_OIL: "3.2"
    GIDK: "96"
    MEST_ID: "1009"
    NGIDK: "96"
    NOIL: "88"
    NTIME_WORK: "660"
    NTIME_WORK_S: "27.5"
    OBV: "8.33333"
    OIL: "88"
    TIME_WORK: "660"
    WATER: "8"
    WELL_ID: "102095"
    WELL_NUM: "11103" */
    let keysArr = Object.keys(arr[0]);
    var str = '';
    keysArr.forEach(key => {
      str += key + '   ';
    });
    console.log(str);
    arr.forEach(element => {
      str = '';
      keysArr.forEach(key => {
        str += element[key] + '   ';
      });
      console.log(str);
    });
  }

  numberOfMonthsBetween(dtB, dtE: Date): number {
    var year1 = dtB.getFullYear();
    var year2 = dtE.getFullYear();
    var month1 = dtB.getMonth();
    var month2 = dtE.getMonth();
    if (month1 === 0) {
      month1++;
      month2++;
    }
    var numberOfMonths;
    numberOfMonths = (year2 - year1) * 12 + (month2 - month1) + 1;
    return numberOfMonths;
  }

  /**
   * Получить список параметров по скважине
   * @param pwell_id - идентификатор скважины (скважина 11106 - 102877)
   * @param phor_codes - список кодов горизонтов через запятую (444,450,480...)
   * @param pdate_beg - дата начала (формат dd.mm.yyyy)
   * @param pdate_end - дата окончания (формат dd.mm.yyyy)
   */
  async getData(pwell_id: string, phor_codes: string, pdate_beg: string, pdate_end: string): Promise<Array<any>> {
    const WEB_PART = 'APDN_DATA_FOR_PROGN';
    const restParams = [{ paramName: 'pwell_id', paramValue: pwell_id },
    { paramName: 'phor_codes', paramValue: phor_codes },
    { paramName: 'pdate_beg', paramValue: pdate_beg },
    { paramName: 'pdate_end', paramValue: pdate_end },];
    const data = (await this.mainUtils.data(PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**Функция обводненности преобразованная*/
  liqFunction(f: number): number {
    let result = Math.log(f / (1 - f));
    return result;
  }

  sum(x: number[]): number {
    var s = 0;
    x.forEach(element => {
      s += element;
    });
    return s
  }

  /** Этап1-Аппроксимация
   * @param data - массив точек с основными показателями
   * @returns объект коэффициентов a,b
  */
  approximation(data: Point[]): Coeff {
    var result = { a: null, b: null };
    var xFi = data.filter(item => item.ffact / 100 != 0 && item.ffact / 100 != 1).map(item => ({ ...item, F: this.liqFunction(item.ffact / 100) }));
    const N = xFi.length;
    if (N > 0) {
      const A = (N * this.sum(xFi.map(el => el.qliqcum * el.F)) - this.sum(xFi.map(el => el.qliqcum)) * this.sum(xFi.map(el => el.F))) /
        (N * this.sum(xFi.map(el => Math.pow(el.qliqcum, 2))) - Math.pow(this.sum(xFi.map(el => el.qliqcum)), 2));
      const B = (this.sum(xFi.map(el => el.F)) - A * this.sum(xFi.map(el => el.qliqcum))) / N;
      result.a = A;
      if (A != 0) { result.b = -B / A; }
    }
    return result;
  }
  /**Этап2-Определение базового периода
   * @param data - массив точек с основными показателями
   * @param a - коэффициент расчетный
   * @param b - коэффициент расчетный
  */
  basePeriodDefinition(data: Point[], a: number, b: number): any {
    var arr = this.getTableFactIndicators(this.startData, a, b);
    var errCalc = this.errorCalculate(arr.slice(arr.length - 3, arr.length), a, standartA, standartB);
    if (errCalc.conditionA && errCalc.conditionCrA && errCalc.conditionCrB
      || errCalc.conditionA && errCalc.conditionCrA && this.avoidCrB) {
      console.log("Расчет прекращается. Базовый период найден.");
      console.log('a=' + a + '; b=' + b);
      return arr;
    } else if (data.length > 6) {
      var newArr = data.slice(1, data.length);
      this.coeff = this.approximation(newArr);
      return this.basePeriodDefinition(newArr, this.coeff.a, this.coeff.b);
    } else if (data.length <= 6 && !this.avoidCrB) {
      console.log("Начинаем проверять только по 1 критерию.");
      this.avoidCrB = true;
      this.coeff = this.approximation(this.startData);
      return this.basePeriodDefinition(this.startData, this.coeff.a, this.coeff.b);
    } else {
      console.log("Расчет невозможно продолжить.");
    }
  }

  /**Формирование таблицы фактичексих показателей
   * @param data - массив точек с основными показателями
   * @param a - коэффтциент расчетный
   * @param b - коэффтциент расчетный
   */
  getTableFactIndicators(data: Point[], a: number, b: number): Point[] {
    data.forEach((el, index) => {
      el.qappliq = 1 - 1 / (1 + Math.exp(a * (el.qliqcum - b)));
      el.qappoil = el.qliq * (1 - el.qappliq);
      el.prodappoil = el.qappoil * el.timeprod / 24;
      var prodappoilArr = [];
      for (var i = 0; i <= index; i++) {
        prodappoilArr.push(data[i].prodappoil);
      }
      el.qappoilcum = this.sum(prodappoilArr);
    });
    return data;
  }

  /**Расчет погрешности
   * Используется критерий по знаку a и критерии по совпадению расчетных и фактических показателей(по текущей и накопленной добыче нефти)
   * @param liteData - массив последних 3 точек с основными показателями
   * @param a - коэффициент
   * @param standartA - стандарт по критерию a (0.1 или 0.03)
   * @param standartB - стандарт по критерию b (0.1 или 0.05)
  */
  errorCalculate(liteData: Point[], a: number, standartA: number, standartB: number): ErrCriteria {
    let result = { conditionA: false, conditionCrA: false, conditionCrB: false };
    // режим 2 критериев
    let crA = this.sum(liteData.map(el => el.prodappoil)) / this.sum(liteData.map(el => el.prodoil)) - 1;
    let crB = liteData[liteData.length - 1].qappoilcum / liteData[liteData.length - 1].qoilcum - 1;
    console.log('crA=' + crA + '; crB=' + crB);
    if (a > 0 && Math.abs(crA) <= standartA && Math.abs(crB) <= standartB) {// расчет прекращается
      result.conditionA = true;
      result.conditionCrA = true;
      result.conditionCrB = true;
    } else {// следующая итерация
      if (a > 0) {
        result.conditionA = true;
      }
      if (Math.abs(crA) <= standartA) {
        result.conditionCrA = true;
      }
      if (Math.abs(crB) <= standartB) {
        result.conditionCrB = true;
      }
    }
    return result;
  }
  /**Этап3-Оптимизация прогнозной модели
   * @param wB - весовой коэффициент
  */
  optimization(data: Point[], aBegin: number, bBegin: number, wB: number): OptimalKoef {
    let result = {
      aopt: null,
      bopt: null
    };
    var matrCrA = [];
    var matrCrB = [];
    var koef = [];
    var aCoef = 0.8;
    const step = 0.05;
    var min = null;
    while (aCoef <= 1.201) {
      let rowA = [];
      let rowB = [];
      let rowKoef = [];
      var bCoef = 0.8;
      while (bCoef <= 1.201) {
        var arr = this.getTableFactIndicators(data, aBegin * aCoef, bBegin * bCoef);
        arr = arr.slice(arr.length - 3, arr.length);
        let crA = this.sum(arr.map(el => el.prodappoil)) / this.sum(arr.map(el => el.prodoil)) - 1;
        let crB = arr[arr.length - 1].qappoilcum / arr[arr.length - 1].qoilcum - 1;
        rowA.push(crA);
        rowB.push(crB);
        var k = Math.abs(crA) + wB * Math.abs(crB);
        rowKoef.push(k);
        if (!min || min > k) {
          min = k;
          result.aopt = aBegin * aCoef;
          result.bopt = bBegin * bCoef;
        }
        bCoef += step;
      }
      matrCrA.push(rowA);
      matrCrB.push(rowB);
      koef.push(rowKoef);
      aCoef += step;
    }
    //результаты для сверки с программой ЛШ
    // console.log('-------------------------------------------------------------------------');
    // console.log(matrCrA);
    // console.log('-------------------------------------------------------------------------');
    // console.log(matrCrB);
    // console.log('-------------------------------------------------------------------------');
    // console.log(koef);
    // console.log('-------------------------------------------------------------------------');
    // console.log(min);
    // console.log(result);
    return result;
  }
  /**Количество дней в году */
  daysInYear(year: number): number {
    return ((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365;
  }
  /**Количество дней в конкретном месяце */
  daysInMonth (month, year): number {
    return new Date(year, month, 0).getDate();
}
  /**
   * Расчет прогнозных показателей
   * @param data - массив основныx показателей (фактические и расчетные)
   * @param kexp - коэффициент эксплуатации
   * @param maxLiq - максимальный уровень обводненности
   * @param Npr - период прогноза (количество лет)
   */
  prognoz(data: Point[], kexp: number, maxLiq: number, Npr: number, aopt: number, bopt: number): Point[] {
    var result = data;
    var ipr = 0;
    var fpr = 0;
    var liteData = data.slice(data.length - 3, data.length);
    let qliq = this.sum(liteData.map(el => el.prodliq)) / (this.sum(liteData.map(el => el.timeprod)) / 24);
    var byMonth = (new Date(data[0].dateop).getMonth() + 1) == new Date(data[1].dateop).getMonth();
    while (ipr < Npr && fpr < maxLiq) {
      var row = null;
      var currentDate = new Date(data[data.length-1].dateop);
      currentDate.setMonth(currentDate.getMonth() + 1)
      let t = byMonth ? currentDate.getFullYear() : data[data.length - 1].t + 1;
      let timeprod = byMonth ? kexp * this.daysInMonth(currentDate.getMonth(), currentDate.getFullYear()) : kexp * this.daysInYear(t);
      let prodliq = qliq * timeprod;
      let qliqcum = data[data.length - 1].qliqcum + prodliq;
      let qappliq = 1 - 1 / (1 + Math.exp(aopt * (qliqcum - bopt)));
      let qoil = qliq * (1 - qappliq);
      let prodoil = qoil * timeprod;
      let qoilcum = data[data.length - 1].qoilcum + prodoil;
      let dateop = byMonth ? currentDate : new Date(t, 0, 0);
      row = {
        t: t,
        qliq: qliq,
        timeprod: timeprod,
        prodliq: prodliq,
        qliqcum: qliqcum,
        qappliq: qappliq,
        qoil: qoil,
        prodoil: prodoil,
        qoilcum: qoilcum,
        dateop: dateop
      };
      fpr = row.qappliq;
      ipr++;
      result.push(row);
    }
    var resultByYears = [];
    result.forEach(item => {
      if (resultByYears.length == 0 || resultByYears[resultByYears.length - 1].t != item.t){
        resultByYears.push({ t: item.t, prodoil: item.prodoil });
      } else {
        resultByYears[resultByYears.length - 1].prodoil = resultByYears[resultByYears.length - 1].prodoil + item.prodoil;
      }
    });
    console.log("В интерфейсе выводится с текущего года включительно 16 лет на прогноз, для сверки вывожу в консоль весь массив факт и прогноз");
    console.log(resultByYears);
    return resultByYears;
  }
}
