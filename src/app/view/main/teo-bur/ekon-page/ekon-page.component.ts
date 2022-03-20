import {Component} from '@angular/core';
import {HotTableRegisterer} from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import {hotSettings} from './settings/expenses-hot-settings';
import {FormulaParserService} from '../../../../services/formula-parser.service';
import {UtilService} from '../../../../services/util.service';

@Component({
  selector: 'app-ekon-page',
  templateUrl: './ekon-page.component.html',
  styleUrls: ['./ekon-page.component.styl']
})
export class EkonPageComponent {


  /**
   * Адрес ячейики с итоговым значением сумм
   */
    // public SUMM_CELL_ADDRESS = 'C';
  public SUMM_CELL_ROW = 0;

  id = 'HotCustomId' + Math.random() * 100000;

  constructor(private formulaParser: FormulaParserService, private  utils: UtilService) {
    this.hotSettings = {
      data: utils.getEmptyData(),
      afterChange: (changes) => {
        console.log(changes);
        console.log('ekon');
        if (changes) {
          changes.forEach(item => {
            this.sourceDataObj[item[0]][item[1]] = item[3];
          });
        }
      },
      ...hotSettings
    };
  }
  private hotRegisterer = new HotTableRegisterer();
  /**
   * Объект с исходными данными (пришедшими с сервера)
   */
  sourceDataObj: any;
  /**
   * Объект с расчитанными данными (после парсера формул), участвует в расчетах
   */
  calculatedData: any;
  // @ts-ignore
  hotSettings: Handsontable.GridSettings;

  /**
   * Очистка области
   */
  public clear(): void {
    this.hotRegisterer.getInstance(this.id).loadData(this.utils.getEmptyData());
  }

  /**
   * Заливка данных для таблицы
   * @param varCosts объект с данными
   */
  fillTableData(varCosts: [][]): void {
    console.log('... fill equipment ....');
    this.sourceDataObj = this.utils.copy(varCosts);
    this.calculatedData = varCosts;
    // this.addSummFormula(this.calculatedData);
    if (this.hotRegisterer.getInstance(this.id)) {
      this.formulaParser.parse(this.calculatedData, 30);
      this.hotRegisterer.getInstance(this.id).loadData(this.calculatedData);
    }
  }

  /**
   * Пересчет данных на странице по объекту формул
   */
  recalc(): void {
    console.log('... expences recalc ... ');
    const newData = this.utils.copy(this.sourceDataObj);
    // this.utils.copyEditableCells(this.hotRegisterer.getInstance(this.id).getData(), newData, [2, 3]);
    this.utils.copyEditableCellsAndRows(this.hotRegisterer.getInstance(this.id).getData(), this.calculatedData, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [1, 2, 3, 4]);
    this.addSummFormula(newData);
    this.sourceDataObj = newData;
    // this.addSummFormula(this.calculatedData);
    if (this.hotRegisterer.getInstance(this.id)) {
      this.formulaParser.parse(newData, 30);
      this.hotRegisterer.getInstance(this.id).loadData(newData);
    }
  }

  /**
   * Добавление формулы сумм()
   * @param items
   */
  addSummFormula(items: [][]): void {
    console.log('.... add summ formula for rows ....');
    // Добавление формулы ИТОГО
    let summFormulas = [];
    items.forEach((value, indexY) => {
      // Игнорируем первую и последнюю строку
      // if (indexY !== 0 && indexY < items.length) {
      //   if (indexY === 1) {
      //     summFormula += `D${indexY + 1}`;
      //   } else {
      //     summFormula += `+D${indexY + 1}`;
      //   }
      // }
      value.forEach((valueX, indexX) => {
        if (indexX > 1 && indexY > 0) {
          if (indexY === 1) {
            summFormulas[indexX] = `=${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
          }
            // else if (items.length  === indexY) {
            //   summFormulas[indexX] += '';
          // }
          else {
            summFormulas[indexX] += `+${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
          }
        }
      });
    });

    // const formulaCell = this.formulaParser.getIndexses(this.SUMM_CELL_ADDRESS);
    items.push([]);
    items.push([]);
    summFormulas.forEach((item, index) => {
      // @ts-ignore
      items[items.length - 1][index] = item;
    });
    // @ts-ignore
    items[items.length - 1][1] = 'ИТОГО';
  }
  /**
   * Получение вычисленных данных, для использования на других страницах расчета
   */
  getCalculatedData(): [][] {
    return this.calculatedData;
  }

  /**
   * Получить объект с формулами расчетов и пользователсьиким изменениями для сохранения
   */
  getSourceData(): any {
    return this.sourceDataObj;
  }
}
