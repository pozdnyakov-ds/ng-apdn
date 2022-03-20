import {Injectable} from '@angular/core';
import {MainUtilsService} from 'main-utils';
import {APP} from '../../app-config';
import {convertXmlToJson} from 'xml2customjs';

export interface Mnk {
  CODE_ORG: string;
  NAME_ORG: string;
}

export interface Field {
  MEST_CODE: string;
  MEST_NAME: string;
}

export interface OE {
  HOR_CODE: string;
  HOR_NAME: string;
}

export interface Well {
  WELL_ID: string;
  WELL_NAME: string;

  ID?: string;
  ORG_ID?: string;
  FIELD_ID?: string;
  STRUCT_NUM?: string;
  DATE_EXPL?: string;
  SPEC_STOCKS?: string;
  DEBIT_WATER?: string;
  BEG_PERC_WATER?: string;
  CF_EXPL_WELL?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  constructor(private mainUtils: MainUtilsService) { }

  /**
   * Получить список МНК
   */
  async getMnks(): Promise<Array<Mnk>> {
    const WEB_PART = 'APDN_ORGS';
    const restParams = [{paramName: 'params', paramValue: '{}'}];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение списка месторождений
   * @param mnkId Идентификатор МНК
   */
  async getFields(mnkId: string): Promise<Array<Field>> {
    const WEB_PART = 'APDN_FIELDS';
    const restParams = [{paramName: 'orgCode', paramValue: mnkId}];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получить список эксплуатационных объектов
   * @param fieldCode Идентификатор месторождения
   */
  async getOes(fieldCode: string): Promise<Array<OE>> {
    const WEB_PART = 'APDN_OE';
    const restParams = [{paramName: 'fieldCode', paramValue: fieldCode}];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение списка пробуренных скважин
   * @param fieldCode идентификатор месторождения
   * @param oeCode идентификатор эксплуатационного объекта
   * @param ptype 1 - новые, 2 - пробуренные
   * @param pactualPer  актуальный период, годы, -1 - период не установлен
   */
  async getExistingWells(fieldCode: string, oeCode: string, orgCode: string, ptype: number, pactualPer: number): Promise<Array<Well>> {
    const WEB_PART = 'APDN_WELLS_LIST'; // APDN_WELLS
    const restParams = [
      {paramName: 'mestCode', paramValue: fieldCode},
      {paramName: 'horCode', paramValue: oeCode},
      { paramName: 'signWell', paramValue: (ptype === 2) ? 1 : 0},
      { paramName: 'pCountYear', paramValue: pactualPer }
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение списка новых скважин
   * @param fieldCode идентификатор месторождения
   * @param orgCode идентификатор организации
   */
  async getNewWells(fieldCode: string, orgCode: string): Promise<Array<Well>> {
    const WEB_PART = 'APDN_GET_NEW_WELLS'; // APDN_WELLS
    const restParams = [
      {paramName: 'pFieldId', paramValue: fieldCode},
      {paramName: 'pOrgId', paramValue: orgCode}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Получение списка скважин
   * @param fieldCode идентификатор месторождения
   * @param oeCode идентификатор эксплуатационного объекта
   */
  async getInitialCalcData(orgCode: string): Promise<Array<Well>> {
    const WEB_PART = 'APDN_FIRST_TABLE';
    const restParams = [
      {paramName: 'porgCode', paramValue: orgCode}
    ];

    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Добавление новой скважин
   * @param wellName  наименование скважины
   * @param orgId     идентификатор организации
   */
  async addWell(wellName: string, orgId: string): Promise<any> {
    const WEB_PART = 'APDN_ADD_WELL';
    const restParams = [
      {paramName: 'wellName', paramValue: wellName},
      {paramName: 'orgId', paramValue: orgId}
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));
    console.log(xmlData);
    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }

  /**
   * Метод добавления новой скважины
   * @param pOrgId    идентификатор организации
   * @param pFieldId  идентификатор месторождения
   * @param pNumWell  номер скважины
   * @param pDateExpl дата эксплуатации
   * @param pSpecStocks удельные запасы
   * @param pDebitWater дебит жидкости
   * @param pBegWater начальная обводненность
   * @param pcfExpl Коэффициэнт эксплуатации
   */
  async addNewWell(pOrgId: string,
                   pFieldId: string,
                   pNumWell: string,
                   pDateExpl: string,
                   pSpecStocks: string,
                   pDebitWater: string,
                   pBegWater: string,
                   pcfExpl: string,
                   stoimost: string,
                   srokAmort: string): Promise<void> {

    const WEB_PART = 'APDN_INSERT_NEW_WELL';
    //  :pOrgId, :pFieldId, :pNumWell, :pDateExpl, :pSpecStocks, :pDebitWater, :pBegWater, :pcfExpl
    const restParams = [
      {paramName: 'pOrgId', paramValue: pOrgId},
      {paramName: 'pFieldId', paramValue: pFieldId},
      {paramName: 'pNumWell', paramValue: pNumWell},
      {paramName: 'pDateExpl', paramValue: pDateExpl},
      {paramName: 'pSpecStocks', paramValue: pSpecStocks.replace(',', '.')},
      {paramName: 'pDebitWater', paramValue: pDebitWater},
      {paramName: 'pBegWater', paramValue: pBegWater},
      {paramName: 'pcfExpl', paramValue: pcfExpl},
      {paramName: 'stoimost', paramValue: stoimost.replace(',', '.')},
      {paramName: 'srokAmort', paramValue: srokAmort} //:stoimost, :srokAmort
    ];
    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
  }

  async checkNewWell(pOrgId: string,
                     pFieldId: string,
                     pNumWell: string): Promise<any> {
    const WEB_PART = 'APDN2_CHEK_NEW_WELL';
    const restParams = [
      {paramName: 'pOrgId', paramValue: pOrgId},
      {paramName: 'pFieldId', paramValue: pFieldId},
      {paramName: 'pNumWell', paramValue: pNumWell}
    ];
    const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
    return  this.mainUtils.metaToFlatFormat(data.data);
  }

  /**
   * Удаление "новой" скважины
   * @param wellName  Наименование скважины
   * @param orgId     Идентификатор организации
   */
  async removeWell(wellId: string): Promise<any> {
    const WEB_PART = 'APDN_REMOVE_WELL';
    const restParams = [
      {paramName: 'wellId', paramValue: wellId}
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));

    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }
  /**
   * Удаление "новой" скважины
   * @param wellName  Наименование скважины
   * @param orgId     Идентификатор организации
   */
  async removeNewWell(wellId: string): Promise<any> {
    const WEB_PART = 'APDN_DELETE_NEW_WELL';
    const restParams = [
      {paramName: 'pId', paramValue: wellId}
    ];

    const xmlData = (this.mainUtils.metaToFlatFormat((await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams)).data));

    const jsonString = JSON.parse(convertXmlToJson(xmlData[0].JSON));
    return jsonString.ROOT;
  }
}
