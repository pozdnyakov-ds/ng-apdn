import { Injectable } from '@angular/core';
import {MainUtilsService} from 'main-utils';
import {Config} from "codelyzer";
import {APP} from "../../app-config";
import {Well} from "./common-data.service";

/**
 * Тип списка расчетов
 */
export interface CalcsList {
  id: string;
  key: string;
  comment: string;
  calcObjects: CalcObj;
}

/**
 * Тип расчета для сохранения объектов
 */
export interface CalcObj {
  /** Объект расчета капитальные вложения - оборудование */
  equipment: object;
  /** Объект расчета капитальные вложения - обустройство */
  arrangement: object;
  /** Объект расчета переменные расходы */
  expenses: object;
  /** Объект расчета ТЭО Бурения */
  // teoBur: {
  //   dataForCalc: object,
  //   fData: object,
  //   data: object,
  // };
  editableCells: any;
  /** Объект расчета Экономических показетелей */
  econIndicators: object;
  /** Объект расчета экономиечских нормативов */
  econNormatives: object;
}

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  constructor(private mainUtils: MainUtilsService) {
    this.saveStrategy = 'localStorage';
  }

  private saveStrategy: 'userStorage' | 'localStorage';

  private readonly CALC_LIST_KEY = 'CALCULATIONS_LIST';

  /**
   * Получить объект со списком расчетов
   */
  async getListObject(selectedWell: Well): Promise<Array<CalcsList>> {
    return this.get(this.CALC_LIST_KEY + selectedWell.ID);
  }

  /**
   * Получить объект расчета
   */
  async getCalcObject(key, selectedWell: Well): Promise<CalcObj> {
    return this.get(key + selectedWell.ID);
  }

  /**
   * Сохранить список расчета
   * @param obj Объект со списком расчетов
   */
  async saveListObject(list: Array<CalcsList>, selectedWell: Well): Promise<void> {
    return this.saveTo(this.CALC_LIST_KEY + selectedWell.ID, list);
  }

  /**
   * Сохранить объект расчета
   * @param obj Объект с элементами расчета
   * @param key ключ объекта расчета
   */
  async saveCalcObj(obj: CalcObj, key: string, selectedWell: Well): Promise<void> {
    return this.saveTo(key + selectedWell.ID, obj);
  }

  /**
   * Метод сохранения объекта в зависимости от стратегии хранения
   * @param key Ключ
   * @param obj Объект сохранения
   * @private
   */
  private async saveTo(key, obj): Promise<void> {
    console.log('saveto: ' + key);
    return new Promise((resolve, reject) => {
      if (this.saveStrategy === 'userStorage') {
        this.mainUtils.putUserData(APP.PORTLET_ID, key, JSON.stringify(obj));
      } else if ( this.saveStrategy === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(obj));
      }
    });
  }

  /**
   * Метод получения объекта в зависимости от стратегии хранения
   * @param key ключ
   * @private
   */
  private async get(key): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.saveStrategy === 'userStorage') {
        resolve( (await this.mainUtils.getUserData(APP.PORTLET_ID, key)));
      } else if ( this.saveStrategy === 'localStorage') {
        if (localStorage.getItem(key) !== undefined
            && localStorage.getItem(key) !== null) {
          resolve(JSON.parse(localStorage.getItem(key)));
        } else {
          return  resolve([]);
        }
      }
    });
  }
}
