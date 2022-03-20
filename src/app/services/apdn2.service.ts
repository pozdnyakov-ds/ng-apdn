import { Injectable } from '@angular/core';
import {APP} from '../../app-config';
import {MainUtilsService} from 'main-utils';

@Injectable({
  providedIn: 'root'
})
export class Apdn2Service {

  constructor(private mainUtils: MainUtilsService) { }

  /**
   *  Для вкладки ТЕО Бурения
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getIEP(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_IEP';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return  this.transponire(this.mainUtils.metaToFlatFormat(data.data), pIsNewWell);
  }

  /**
   *  Кап. вложения обустройство
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getObustr(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_AMORT_OBUSTR';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }
  /**
   *  Кап. вложения обустройство
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getNormativ(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_LAST_NORM';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return  this.transponire(this.mainUtils.metaToFlatFormat(data.data), pIsNewWell);
  }

  /**
   *  Нормативы обустройство для показа
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getNormativ2(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_LAST_NORM';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return  this.transponire(this.mainUtils.metaToFlatFormat(data.data), '1');
  }

  /**
   *  Кап. вложения оборудование
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getObor(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_AMORT_OBOR';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   *  Переменные расходы
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getPeremRasch(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_PEREM_RASCH';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.transponire(this.mainUtils.metaToFlatFormat(data.data), pIsNewWell);
  }

  /**
   *  Экономические показатели
   * @param pOrgCode  код организации
   * @param pMestCode код месторождения
   * @param pNumWell  номер скважины
   * @param pIsNewWell  признак новая скважина
   * @param pYear год
   */
  async getParamTeo(pOrgCode, pMestCode, pNumWell, pIsNewWell, pYear): Promise<Array<any>> {
    const WEB_PART = 'APDN2_GET_PARAM_TEO';
    const restParams = [
      {paramName: 'pOrgCode', paramValue: pOrgCode},
      {paramName: 'pMestCode', paramValue: pMestCode},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pIsNewWell', paramValue: pIsNewWell},
      {paramName: 'pYear', paramValue: pYear}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Преобразование экономических показателей, переменных-расходов
   * @param data
   * @param pIsNewWell
   * @private
   */
  private transponire(data, pIsNewWell): any {
    console.log('transponire');
    // Если новая скважина возвращаем как есть, иначе транфсормируем
    return (pIsNewWell === '1') ? data : this.transform(data);
  }

  /**
   * "Транспонирование" переменных расходов и экономических показателей
   * @param data
   * @private
   */
  private transform(data): any {
    // tslint:disable-next-line:no-shadowed-variable
    const groups = data.reduce((groups, item) => {
      const group = (groups[item.PARAM_CODE] || []);
      group.push(item);
      groups[item.PARAM_CODE] = group;
      return groups;
    }, {});

    const rezArr = [];
    Object.keys(groups).forEach(gr => {
      const obj = {NO_PP: gr};
      groups[gr].forEach(item => {
          // ВНИМАНИЕ ПОРЯДОК ВАЖЕН
          //if (item.NO_PP === gr) {
              // @ts-ignore
              obj.NAME = item.NAME;
              if (item.Y1 === 'Y1') {
                // @ts-ignore
                obj.VAL = item.VAL;
              }
              // obj[item.YEAR] = item.VAL;
              obj[item.Y1] = item.VAL;
          //}
      });
      rezArr.push(obj);
    });
    console.log(rezArr);
    return rezArr;
  }
}
