import {Injectable} from '@angular/core';
import {editableCells} from "../view/main/teo-bur/settings/hot-settings";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() {
  }

  /**
   * Получение набора пустых данных для handsontable
   * @param width ширина - количество элементов
   * @param height высота - количество элементов
   */
  getEmptyData(width: number = 100, height: number = 100): any {
    const clean: Array<Array<any>> = [];
    for (let i = 0; i < 100; i++) {
      clean.push([]);
      for (let j = 0; j < 100; j++) {
        clean[i].push('');
      }
    }
    return clean;
  }

  /**
   * Метод создания копии объекта
   * @param arrangement объект для копирования
   */
  copy(arrangement: any): any {
    return JSON.parse(JSON.stringify(arrangement));
  }

  /**
   * Копирование набора редактируемых ячеек из исходного массива в целевой
   * @param sourceData массив источник
   * @param targetData целевой массиd
   * @param copyColumns индексы колонок для копирования
   */
  copyEditableCells(sourceData: [][], targetData: [][], copyColumns: Array<number>, skipRows: number = 1): void {
    sourceData.forEach((value, indexY) => {
      if (skipRows <= indexY) {
        value.forEach((val, indexX) => {
          if (copyColumns.includes(indexX) &&
            sourceData[indexY] != null &&
            sourceData[indexY][indexX] != null &&
            targetData[indexY] != null &&
            targetData[indexY][indexX] != null) {
            if (!isNaN(parseFloat(sourceData[indexY][indexX]))) {
              // @ts-ignore
              targetData[indexY][indexX] = parseFloat(sourceData[indexY][indexX]);
            } else {
              targetData[indexY][indexX] = sourceData[indexY][indexX];
            }
          }
        });
      }
    });
  }

  /**
   * Копирование набора редактируемых ячеек из исходного массива в целевой
   * @param sourceData массив источник
   * @param targetData целевой массиd
   * @param copyColumns индексы колонок для копирования
   */
  copyEditableCellsAndRows(sourceData: [][], targetData: [][], copyColumns: Array<number>, rows: Array<number>): void {
    sourceData.forEach((value, indexY) => {
      value.forEach((val, indexX) => {
        if (rows.includes(indexY) && copyColumns.includes(indexX) &&
          sourceData[indexY] != null &&
          sourceData[indexY][indexX] != null &&
          targetData[indexY] != null &&
          targetData[indexY][indexX] != null
          && indexY < value.length - 1) { // Последняя строка игнорируется
          if (!isNaN(parseFloat(sourceData[indexY][indexX]))) {
            // @ts-ignore
            targetData[indexY][indexX] = parseFloat(sourceData[indexY][indexX]);
          } else {
            targetData[indexY][indexX] = sourceData[indexY][indexX];
          }
        }
      });
    });
  }

  /**
   * Конвертация массива объектов в двухмерный массив
   * @param data двухмерный массив
   */
  convertToTwoDimensional(data, dictionary): [][] {
    console.log('*** convertToTwoDimensional');
    const headers = [];
    Object.keys(data[0]).forEach(item => {
      if (dictionary[item] !== undefined) {
        headers.push(dictionary[item]);
      } else if (item.startsWith('Y')) {
        headers.push(item.substr(1, item.length - 1));
      } else {
        headers.push(item);
      }
    });
    // @ts-ignore
    // return [Object.keys(data[0])].concat(data.map((item, index) => {
    return [headers].concat(data.map((item => Object.values(item))));
  }

  /**
   * Заливка данных для первой таблицы из teoBur
   * @param dataForCalc данные для расчета используемые в таблице (передача объекта по ссылке)
   * @param newTeoBurData данные пришедшие из сервисов
   */
  fillTeoData(dataForCalc: any, newTeoBurData: Array<any>): void {
    console.log('******** fillDataForCalc ********');
    if (dataForCalc && newTeoBurData) {
      // dataForCalc[5][3] = newTeoBurData.find(item => item.NAME === 'Средняя цена без коммерческих расходов и экспортной пошлины').VAL;
      // dataForCalc[6][3] = newTeoBurData.find(item => item.NAME === 'Переменные расходы на добычу нефти').VAL;
      // dataForCalc[7][3] = newTeoBurData.find(item => item.NAME === 'НДПИ(Обычная)').VAL;
      // dataForCalc[8][3] = newTeoBurData.find(item => item.NAME === 'НДПИ(Льготная по вязкости)').VAL;
      // dataForCalc[9][3] = newTeoBurData.find(item => item.NAME === 'НДПИ(Льготная по  выработанности)').VAL;
      // dataForCalc[10][3] = newTeoBurData.find(item => item.NAME === 'Срок амортизации скважин').VAL;
      // dataForCalc[11][3] = newTeoBurData.find(item => item.NAME === 'Норма дисконтирования').VAL;
      // dataForCalc[12][3] = newTeoBurData.find(item => item.NAME === 'Налог на имущество').VAL;
      // dataForCalc[13][3] = newTeoBurData.find(item => item.NAME === 'Налог на прибыль').VAL;
      newTeoBurData.forEach((item, index) => {
        // Игнорируем формулы
        if (![1, 2].includes(index)) {
          dataForCalc[index + 2][3] = item.VAL;
        }
      });
    }
  }

  /**
   * Метод очистки области первой таблицы
   * @param dataForCalc объект с данными для handsontable
   */
  fillTeoClearData(dataForCalc: any): void {
    console.log('***** clear data');
    for (let i = 0; i <= 11; i++) {
      if (![1, 2].includes(i)) {
        dataForCalc[i + 2][3] = '';
      }
    }
  }

  /**
   * Установка наименования скважины
   * @param dataForCalc объект с данными для handsontable
   * @param wellName Наименование скважины
   */
  fillWellName(dataForCalc: any, wellName: string): void {
    const cell = {r: 15, c: 1};
    dataForCalc[cell.r][cell.c] = 'Технико-экономическое обоснование бурения скважины № ' + wellName;
  }

  /**
   * Установка заголовка с годами
   * @param data объект с данными handsontable
   * @param peremRash2D объект с данными переменных расходов
   */
  fillYearsHeader(data: any, peremRash2D: [][]): void {
    // Перебор только строки с заголовками
    peremRash2D[0].forEach((item, index) => {
      if (index >= 2) {
        data[18][index] = item;
      }
    });
  }

  /**
   * Очистка прогнозных ячеек
   * @param dataForCalc объект с данными handsontable
   */
  clearPrognoz(dataForCalc: any): void {
    dataForCalc[26].forEach((item, index) => {
      if (index >= 2 && index <= 17) {
        dataForCalc[26][index] = 0;
      }
    });
    dataForCalc[27].forEach((item, index) => {
      if (index >= 2 && index <= 17) {
        dataForCalc[27][index] = 0;
      }
    });
    dataForCalc[28].forEach((item, index) => {
      if (index >= 2 && index <= 17) {
        dataForCalc[28][index] = 0;
      }
    });
  }

  /**
   * Копирование редактируемых ячеек из в
   * @param from объект исходник
   * @param to целевой объект
   */
  copyAllEditableCells(from, to): void {
    editableCells.forEach((item, index) => {
      if (to[item.r] === undefined || to[item.r] === null) {
        to[item.r] = [];
      }
      if (!isNaN(parseFloat(from[item.r][item.c]))) {
        to[item.r][item.c] = parseFloat(from[item.r][item.c]);
      } else {
        to[item.r][item.c] = from[item.r][item.c];
      }
    });
  }

  /**
   * Очистка редактируемых ячеек объектов
   * @param dataObject
   */
  clearEditableCells(dataObject): void {
    editableCells.forEach((item, index) => {
      dataObject[item.r][item.c] = 0;
    });
  }
}
