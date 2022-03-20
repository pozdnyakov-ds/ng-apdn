import { Injectable } from '@angular/core';
import {APP} from '../../app-config';
import {convertXmlToJson} from 'xml2customjs';
import {MainUtilsService} from 'main-utils';

/** Вариант расчета по скважине */
export interface CalcPlan {
  id: string;
  name: string;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalcPlansService {

  constructor(private mainUtils: MainUtilsService) { }

  /**
   * Получение списка с вариантами расчетов
   * @param orgId     Идентификатор организации
   */
  async getListCalcResult(orgId: string, pWellId: string): Promise<any> {
    const WEB_PART = 'APDN_GET_LIST_CALC_RESULT';
    const restParams = [
      {paramName: 'orgId', paramValue: orgId},
      {paramName: 'pWellId', paramValue: pWellId}
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));
    if (xmlData.length > 0) {
      const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
      return jsonString.ROOT;
    }
    return [];
  }

  /**
   * Сохранение варианта расчета
   * @param orgId         Идентификатор организации
   * @param pResult       Сохраняемый результат
   * @param pIdResult     Идентификатор записи - -1 при создании новой записи
   * @param pNameResult   Наименование резулт
   * @param pWellId       Идентификатор скважины
   */
  async saveCalcResult(orgId: string, pResult: string, pIdResult: string, pNameResult: string, pWellId: string): Promise<any> {
    const WEB_PART = 'APDN_SAVE_CALC_RESULT';
    const restParams = [
      {paramName: 'orgId', paramValue: orgId},
      {paramName: 'pResult', paramValue: pResult},
      {paramName: 'pIdResult', paramValue: pIdResult},
      {paramName: 'pNameResult', paramValue: pNameResult},
      {paramName: 'pWellId', paramValue: pWellId}
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));

    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }

  /**
   * Удаление варианта расчета
   * @param pIdResult идентификатор варианта расчета
   */
  async removeCalcResult(pIdResult: string): Promise<any> {
    const WEB_PART = 'APDN_REMOVE_CALC_RESULT';
    const restParams = [
      {paramName: 'pIdResult', paramValue: pIdResult},
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));

    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }

  /**
   * Получение списка расчетов
   */
  async TEMP_getListCalcResult(): Promise<Array<CalcPlan>> {
    return new Promise(resolve => [{
      name: 'План расчета 1',
      id: '1'
    }, {
      name: 'План расчета 2',
      id: '2'
    }]);
  }
}
