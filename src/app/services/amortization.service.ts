import {Injectable} from '@angular/core';
import {MainUtilsService} from 'main-utils';
import {APP} from '../../app-config';
import {capInvArrangement} from "./static-data/cap-inv-arrangement";
import {capInvEquipment} from "./static-data/cap-inv-equipment";
import {variableCosts} from "./static-data/variable-costs";
import {teoData} from "./static-data/teo-data";

export interface DictionaryItem {
  ID: string;
  ELEM_CODE: string;
}
/** Тип данных "Амортизация отчислений" */
export interface AmortDeduct {
  PER_BEG: string;
  ELEM_CODE: string;
  ID: string;
  PARENT_ID: string;
  PCOST: string;
  PPER: string;
  VALS: string;
}
/**
 * Сервис по работе с процедурами/данными амортизации
 */
@Injectable({
  providedIn: 'root'
})
export class AmortizationService {

  constructor(private mainUtils: MainUtilsService) { }

  /**
   * Получение данных амортизации
   * @param wellId  идентификатор скважины
   * @param nsiId список идентификаторов из справочника
   * @param n количество периодов
   */
  async getAmortizationData(wellId: number, nsiId: string, n: number): Promise<Array<AmortDeduct>> {
    const WEB_PART = 'APDN_AMORTIZATION_DATA';
    const restParams = [
      {paramName: 'well_id', paramValue: wellId},
      {paramName: 'nsi_ids', paramValue: nsiId},
      {paramName: 'n', paramValue: n}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение данных по справочнику "Переменные расходы"
   */
  async getExpensesData(): Promise<Array<AmortDeduct>> {
    const WEB_PART = 'APDN_EXPENSES';
    const restParams = [];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение справочника "обустройство"
   */
  async getAmortDictiObustr(): Promise<Array<DictionaryItem>> {
    const WEB_PART = 'APDN_AMORT_OBUSTR';
    const restParams = [];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }
  /**
   * Получение справочника "оборот"?
   */
  async getAmortDictiObor(): Promise<Array<DictionaryItem>> {
    const WEB_PART = 'APDN_AMORT_OBOR';
    const restParams = [];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение данных для вкладок, обустройство оборудование
   * Mega Заглушка! [+]
   * @param pOrgCode  код организации
   * @param pNumWell  номер скважины
   * @param pDateIn дата ввода в эксплуатацию dd.mm.yyyy hh24:mi:ss
   * @param ptypeObj  тип 1 - обустройство, 2-оборудование, 0-бурение.
   */
  async getCapitalInwestments(pOrgCode, pNumWell, pDateIn: string, ptypeObj ): Promise<Array<any>> {
    const WEB_PART = 'APDN_GET_AMORT_WELLS';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pDateIn', paramValue: pDateIn},
      {paramName: 'ptypeObj', paramValue: ptypeObj}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
    // return new Promise((resolve, reject) => {
    //   if (ptypeObj === 1) {
    //     resolve(capInvArrangement);
    //   } else {
    //     resolve(capInvEquipment);
    //   }
    // });
  }

  /**
   * Стабовая заглушка для получения данных вкладка "Пемененные расходы"
   * Mega Заглушка!
   */
  async getVariableCosts(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
        resolve(variableCosts);
    });
  }

  /**
   * Возврат данных для ТЭО Бурения
   * Mega Заглушка!
   */
  async getTeoData(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      resolve(teoData);
    });
  }

  /**
   * 10.11.2021
   * Получение данных для вкладки капитальные вложения "Оборудование"
   * @param pOrgCode  Идентификатор организации
   * @param pNumWell Идентификатор скважины
   * @param pDateIn Дата ввода в эксплуатацию
   * @param ptypeObj тип 0 - бурение, 1 - оборудование, 2 - обслуживание
   */
  async getEq(pOrgCode, pNumWell, pDateIn: string, ptypeObj ): Promise<Array<any>> {
    const WEB_PART = 'APDN_AMORT_EQ';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pDateIn', paramValue: pDateIn},
      {paramName: 'ptypeObj', paramValue: ptypeObj}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * 10.11.2021
   * @param pOrgCode  Идентификатор организации
   * @param pNumWell  Идентификатор скважины
   * @param pDateIn Дата ввода в эксплуатацию
   * @param ptypeObj  тип 0 - бурение, 1 - оборудование, 2 - обслуживание
   */
  async getArr(pOrgCode, pNumWell, pDateIn: string, ptypeObj ): Promise<Array<any>> {
    const WEB_PART = 'APDN_AMORT_ARR';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pDateIn', paramValue: pDateIn},
      {paramName: 'ptypeObj', paramValue: ptypeObj}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * 14.11.2021
   * @param pOrgCode  Получение данных по переменным расходам
   */
  async getVarCosts(pOrgCode: string): Promise<Array<any>> {
    const WEB_PART = 'APDN_VAR_EXP';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение данных для вкладки teo бурение
   * @param pOrgCode
   * @param pNumWell
   * @param pDateIn
   * @param ptypeObj
   * @param pYear
   */
  async getTeoBur(pOrgCode, pNumWell, pDateIn: string, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN_TEO_BUR';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode}, //:pOrgCode, :pNumWell, :pYear, :pDateIn
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pYear', paramValue: pYear},
      {paramName: 'pDateIn', paramValue: pDateIn}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

}
