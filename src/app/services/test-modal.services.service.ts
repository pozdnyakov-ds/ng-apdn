import { Injectable } from '@angular/core';
import { MainUtilsService } from 'main-utils';
import { APP } from 'src/app-config';



export interface MyTest {
  /**Скорректированная дата */
  dt: string;
  /**добыча нефти */
  prodoil: number;
  /**добыча жидкости */
  prodliq?: number;
  /**обводненность в %. */
  ffact?: number;
  /**дебит нефти */
  qoil?: number;
  /**дебит жидкости */
  qliq?: number;
  /**накопленная добыча нефти */
  qoilcum?: number;
  /**Доп. добыча нефти за счет ГТМ, т */
  noil?: number;
  /**Уменьшение добычи врлы за счет ГТМ, т */
  ngidk?: number;
  /**Накопл. доп. добыча нефти за счет ГТМ, т */
  oil?: number;
}



@Injectable({
  providedIn: 'root'
})
export class TestModalServicesService {
  constructor(private mainUtils: MainUtilsService) { }


  /** Запуск прогноза для выбранной скважины
   * @param pwell_id - id выбранной скважины
   * @param phor_codes - коды объектов эксплуатации через ,
   * @param pdate_beg - дата начала, по умолчанию '01.01.1900'
   * @param pdate_end - дата окончания, по умолчанию '01.01.3000'
   */
   async run(pwell_id: string, phor_codes: string, pdate_beg: string, pdate_end: string,
    org_code: string,
    mest_code: string,
    hor_codes: string,
    struct_num: string): Promise<MyTest[]> {
    console.log("Получение данных для TestModal...");
    if (!pdate_beg) { pdate_beg = '01.01.1900'; }
    if (!pdate_end) { pdate_end = '01.01.3000'; }
    //this.startData = [];
    let startData: MyTest[] = [];
    const inputData = await this.getData(pwell_id, phor_codes, pdate_beg, pdate_end,
      org_code, mest_code, hor_codes, struct_num);
    if (inputData) {
      this.dataArrayToString(inputData);

      inputData.forEach(item => startData.push({
        dt: `${(new Date(item.DATE_OP)).getMonth()}.${(new Date(item.DATE_OP)).getFullYear()}`,
        prodoil: Number(item.OIL),
        prodliq: Number(item.GIDK),
        ffact: Number(item.OBV),
        qoil: Number(item.DEB_OIL),
        qliq: Number(item.DEB_GIDK),
        qoilcum: Number(item.NOIL),
        noil: Number(item.NOIL),
        ngidk: Number(item.NGIDK),
        oil: Number(item.OIL)
      }));
    }
    return startData;
  }


  /**
   * Получить список параметров по скважине
   * @param pwell_id - идентификатор скважины (скважина 11106 - 102877)
   * @param phor_codes - список кодов горизонтов через запятую (444,450,480...)
   * @param pdate_beg - дата начала (формат dd.mm.yyyy)
   * @param pdate_end - дата окончания (формат dd.mm.yyyy)
   */
   async getData(pwell_id: string, phor_codes: string, pdate_beg: string, pdate_end: string,
    org_code: string,
    mest_code: string,
    hor_codes: string,
    struct_num: string): Promise<Array<any>> {
      /*
      const WEB_PART = 'APDN_DATA_FOR_PROGN';
      const restParams = [{ paramName: 'pwell_id', paramValue: pwell_id },
      { paramName: 'phor_codes', paramValue: phor_codes },
      { paramName: 'pdate_beg', paramValue: pdate_beg },
      { paramName: 'pdate_end', paramValue: pdate_end },];
      const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
      return this.mainUtils.metaToFlatFormat(data.data);
*/

      const WEB_PART = 'APDN_DATA_FOR_TEST'; //Mega2
      const restParams = [{ paramName: 'org_code', paramValue: org_code },
      { paramName: 'mest_code', paramValue: mest_code },
      { paramName: 'hor_codes', paramValue: hor_codes },
      { paramName: 'struct_num', paramValue: struct_num },];
      const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
      return this.mainUtils.metaToFlatFormat(data.data);


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




}
