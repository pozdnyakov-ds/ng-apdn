import {Component} from '@angular/core';
import {HotTableRegisterer} from '@handsontable/angular';
import {clearData} from './settings/clear-data';
import {hotSettings} from './settings/amorti-hot-settings';
import * as Handsontable from 'handsontable';
import {FormulaParserService} from '../../../../services/formula-parser.service';
import {UtilService} from '../../../../services/util.service';

@Component({
  selector: 'app-amort-deduction-arrangement-page',
  templateUrl: './amort-deduction-arrangement-page.component.html',
  styleUrls: ['./amort-deduction-arrangement-page.component.styl']
})
export class AmortDeductionArrangementPageComponent {
  /**
   * Адрес ячейики с итоговым значением сумм
   */
  // public readonly SUMM_CELL_ADDRESS = 'G1';
  public readonly SUMM_CELL_ADDRESS = 'D1';

  private hotRegisterer = new HotTableRegisterer();

  id = 'amortiDeductArrangmenetHotInstance';
  /**
   * Объект с исходными данными
   */
  sourceDataObj: any;
  /**
   * Объект с расчитанными данными
   */
  calculatedData: any;

  // @ts-ignore
  hotSettings: Handsontable.GridSettings;

  constructor(private formulaParser: FormulaParserService, private utils: UtilService) {
    this.hotSettings = {
      data: utils.getEmptyData(),
      ...hotSettings
    };
  }

  /**
   * Заливка данных для таблицы
   * @param arrangement объект с данными
   */
  fillTableData(arrangement: [][], isNewWell: boolean): void {
    //if (!isNewWell) {
      console.log('... fill arrangement ....');
      this.sourceDataObj = this.utils.copy(arrangement);
      this.calculatedData = arrangement;
      this.addSummFormula(this.calculatedData);
      if (this.hotRegisterer.getInstance(this.id)) {
        this.formulaParser.parse(this.calculatedData, 30);
        this.hotRegisterer.getInstance(this.id).loadData(this.calculatedData);

        const hot = this.hotRegisterer.getInstance(this.id);
        const plugin = hot.getPlugin('hiddenColumns');

        plugin.hideColumns(this.hotSettings.hiddenColumns.columns);
      // } else {
      //   // this.formulaParser.parse(this.calculatedData, 30);
      //   this.hotRegisterer.getInstance(this.id).loadData(arrangement);
      // }
    }
  }

  /**
   * Пересчет данных на странице по объекту формул
   */
  recalc(): void {
    console.log('... arrangement recalc ... ');
    const newData = this.utils.copy(this.sourceDataObj);
    this.utils.copyEditableCells(this.calculatedData, newData, [2, 3, 4, 5]);
    this.addSummFormula(newData);
    if (this.hotRegisterer.getInstance(this.id)) {
      this.formulaParser.parse(newData, 30);
      this.hotRegisterer.getInstance(this.id).loadData(newData);
    }
  }



  /**
   * Корректировка приходящего объекта на предмет добавления формулы суммы ИТОГО
   * @param arrangement объект с данными
   */
  addSummFormula(arrangement: [][]): void {
    const ColF = 5; // 5=F F - столбец с индексмо года с которого необходимо учитывать сумму
    const ColD = 3; // 3=D D - столбец с итоговой суммой,
    // Добавление формулы ИТОГО для каждой строки с учетом года
    arrangement.forEach((valueY, indexY) => {
      let currentRowSummFormula = '';
      // Последняя строка для поля ИТОГО (скрытая), первая строка для заголовков
      if (indexY < arrangement.length - 1 && indexY !== 0) {
        valueY.forEach((valueX, indexX) => {
          // Игнорируем строку с заголовками, и последнюю строку - в ней поля ИТОГО;
          if (indexY !== 0 && indexX > ColF) {
            // @ts-ignore
            if ((indexX - ColF) >= parseInt(arrangement[indexY][ColF], 10)) {
              if (currentRowSummFormula.length === 0) { // Смещение по оси X уже учтено в константе ColF
                currentRowSummFormula += `=${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
              } else {
                currentRowSummFormula += `+${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
              }
            }
          }
        });
        // @ts-ignore
        arrangement[indexY][3] = currentRowSummFormula;
      }
    });

    // Добавление формулы ИТОГО
    let summFormula = '=(';
    arrangement.forEach((value, indexY) => {
      // Игнорируем первую и последнюю строку
      if (indexY !== 0 && indexY < arrangement.length - 1) {
        if (indexY === 1) {
          summFormula += `D${indexY + 1}*C${indexY + 1}`;
        } else {
          summFormula += `+D${indexY + 1}*C${indexY + 1}`;
        }
      }
    });
    summFormula +=  ')*0.001';
    console.log(summFormula);
    const formulaCell = this.formulaParser.getIndexses(this.SUMM_CELL_ADDRESS);
    // @ts-ignore
    arrangement[formulaCell.y][formulaCell.x] = summFormula;

    // Сумма по годам
    console.log('.... summByYear ....');
    const val = {};
    arrangement.forEach((items, indexY) => {
      // Игнорируем первую и последнюю строку
      if (indexY !== 0 && indexY < arrangement.length - 1) {
        items.forEach((value, indexX) => {
          if (indexX > ColF) {
            if (val[indexX] === undefined) {
              val[indexX] = `=(${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
            } else {
              val[indexX] += `+${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
            }

            // Присвоение формул, если это предпоследняя строка
            if (indexY === arrangement.length - 2) {
              // @ts-ignore
              arrangement[0][indexX] = `${val[indexX]})*0.001`;
            }
          }
        });
      }
    });
  }

  /**
   * Получение вычисленных данных, для использования на других страницах расчета
   */
  getCalculatedData(): [][] {
    return this.calculatedData;
  }
}
