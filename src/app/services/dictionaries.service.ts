import { Injectable } from '@angular/core';
import {APP} from '../../app-config';
import {MainUtilsService} from 'main-utils';
import { toXML } from 'jstoxml';
import { convertXmlToJson } from 'xml2customjs';


export interface Action {
  org_id: string;
  dataset_id: number;
  action: string;
  body?: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class DictionariesService {

  constructor(private mainUtils: MainUtilsService) { }

  /**
   * Получение списка справочников (с метаинформацией)
   */
  async getDataSets(): Promise<Array<any>> {
    const WEB_PART = 'APDN_DICTI_DATASETS';
    const restParams = [];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Метод "действие" со структуро вида:
   *
   * @param json
   */
  async action(json: Action ): Promise<any> {
    console.log('getDataSetData');
    const WEB_PART = 'APDN_DICTI_DATASETS_ACTION';
    if (json.body && json.body.length > 0) {
      json.body = json.body.map(item => {
        const obj = new Object();
        obj['DATA'] = item;
        return obj;
      });
    }
    const restParams = [{paramName: 'pconfig', paramValue: this.toXMLLocal(json)}];

    const data = await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams);
    const xmlData = this.mainUtils.metaToFlatFormat(data.data);
    // @ts-ignore
    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }

  toXMLLocal(json: Action): string {
    return `<root>${ toXML(json)}</root>`;
  }

  async getNormative(): Promise<any> {
    console.log('getNormative');
    const WEB_PART = 'APDN_NORMATIV_16';
    const restParams = [];
    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  async setNormative(xml: any): Promise<any> {
    console.log('setNormative');
    const WEB_PART = 'APDN_SAVE_NORMATIV';
    const restParams = [{paramName: 'pResult', paramValue: xml}];
    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  // MegaTest (тестирование работы через сервис)
  async setNormative_MTest(json: any): Promise<any> {
    console.log('setNormative');
    const WEB_PART = 'APDN_SAVE_NORMATIV_MTEST';
    //const restParams = [{paramName: 'pResult', paramValue: json}];
    const restParams = [{
      paramName: 'body',
      paramValue: JSON.stringify(json)
    }];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }


}
