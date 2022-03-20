import {Component} from '@angular/core';
import {HotTableRegisterer} from '@handsontable/angular';
import {hotSettings} from './settings/amorti-hot-settings';
import * as Handsontable from 'handsontable';
import {FormulaParserService} from '../../../../services/formula-parser.service';
import {UtilService} from '../../../../services/util.service';


@Component({
  selector: 'app-amort-deduction-equipment-page',
  templateUrl: './amort-deduction-equipment-page.component.html',
  styleUrls: ['./amort-deduction-equipment-page.component.styl']
})
export class AmortDeductionEquipmentPageComponent {

  /**
   * Адрес ячейики с итоговым значением сумм
   */
  public readonly SUMM_CELL_ADDRESS_SRC = 'D';
  public SUMM_CELL_ADDRESS = 'D';

  private hotRegisterer = new HotTableRegisterer();
  id = 'amortiDeductEquipmentHotInstance_' + new Date().getDate() + '_' + Math.random();
  // @ts-ignore
  hotSettings: Handsontable.GridSettings;

  /** Исходный объект но с формулами используется для пересчета в парсере формул */
  sourceDataObj: any;
  /** Предрасчитанный объект, используется как объект для данных основной страницы */
  calculatedData: any;
  private isNewWell: boolean;

  constructor(private formulaParser: FormulaParserService, private utils: UtilService) {

    this.hotSettings = {
      data: utils.getEmptyData(),
      afterChange: (changes) => {
        if (changes) {
          changes.forEach(item => {
            this.sourceDataObj[item[0]][item[1]] = item[3];
          });
        }
      },
      ...hotSettings
    };
  }

  /**
   * Очистка области
   */
  public clear(): void {
    this.hotRegisterer.getInstance(this.id).loadData(this.utils.getEmptyData());
  }

  /**
   * Заливка данных для таблицы
   * @param equipment объект с данными
   */
  // fillTableData(equipment: [][]): void {
  //   console.log('... fill equipment ....');
  //   this.sourceDataObj = this.utils.copy(equipment);
  //   this.calculatedData = equipment;
  //   this.addSummFormula(this.calculatedData);
  //   if (this.hotRegisterer.getInstance(this.id)) {
  //     this.formulaParser.parse(this.calculatedData, 30);
  //     this.hotRegisterer.getInstance(this.id).loadData(this.calculatedData);
  //   }
  // }

  /**
   * Заливка данных для таблицы
   * @param equipment объект с данными
   * @param isNewWell признак новой скважины
   */
  fillTableData(equipment: [][], isNewWell: boolean): void {
    console.log('... *************************** ...');
    this.isNewWell = isNewWell;
    // if (!isNewWell) {
    this.sourceDataObj = this.utils.copy(equipment);
    this.calculatedData = equipment;
    this.addSummFormula(this.calculatedData);
    // this.additionalFormulas(this.calculatedData);
    if (this.hotRegisterer.getInstance(this.id)) {
      this.formulaParser.parse(this.calculatedData, 30);
      this.hotRegisterer.getInstance(this.id).loadData(this.calculatedData);
    }
    // } else {
    //   console.log('******* fill new well equipment data *********');
    //   if (this.hotRegisterer.getInstance(this.id)) {
    //     this.sourceDataObj = this.utils.copy(equipment);
    //     // this.formulaParser.parse(this.calculatedData, 30);
    //     this.hotRegisterer.getInstance(this.id).loadData(this.sourceDataObj);
    //   }
    // }
  }

  /**
   * Пересчет данных на странице по объекту формул
   */
  recalc(): void {
    // if (!this.isNewWell) {
    console.log('... equipment recalc ... ');
    this.calculatedData = this.utils.copy(this.sourceDataObj);
    this.utils.copyEditableCells(this.hotRegisterer.getInstance(this.id).getData(), this.calculatedData, [2, 3, 4, 5]);
    this.addSummFormula(this.calculatedData);
    // this.additionalFormulas(this.calculatedData);
    // this.sourceDataObj = newData;
    if (this.hotRegisterer.getInstance(this.id)) {
      this.formulaParser.parse(this.calculatedData, 30);
      this.hotRegisterer.getInstance(this.id).loadData(this.calculatedData);
    }
    // } else {
    //   if (this.hotRegisterer.getInstance(this.id)) {
    //     // this.formulaParser.parse(this.calculatedData, 30);
    //     this.hotRegisterer.getInstance(this.id).loadData(this.sourceDataObj);
    //   }
    // }
  }

  addSummFormula(arrangement: [][]): void {
    // Добавление формулы ИТОГО
    let summFormula = '=';
    arrangement.forEach((value, indexY) => {
      // Игнорируем первую и последнюю строку
      if (indexY !== 0 && indexY < arrangement.length) {
        if (indexY === 1) {
          summFormula += `D${indexY + 1}*C${indexY + 1}`;
        } else {
          summFormula += `+D${indexY + 1}*C${indexY + 1}`;
        }
      }
    });
    this.SUMM_CELL_ADDRESS = this.SUMM_CELL_ADDRESS_SRC + (arrangement.length + 2);
    summFormula += '';
    console.log(summFormula);
    const formulaCell = this.formulaParser.getIndexses(this.SUMM_CELL_ADDRESS);
    arrangement.push([]);
    arrangement.push([]);
    // @ts-ignore
    arrangement[formulaCell.y][1] = 'ИТОГО';
    // @ts-ignore
    arrangement[formulaCell.y][formulaCell.x] = summFormula;
  }

  /**
   * Корректировка приходящего объекта на предмет добавления формулы суммы ИТОГО
   * @param arrangement объект с данными
   */
  addSummFormulaOld(arrangement: [][]): void {
    const ColF = 5; // 5=F F - столбец с индексмо года с которого необходимо учитывать сумму
    const ColD = 3; // 3=D D - столбец с итоговой суммой,
    // Добавление формулы ИТОГО для каждой строки с учетом года
    arrangement.forEach((valueY, indexY) => {
      let currentRowSummFormula = '';
      // Последняя строка для поля ИТОГО (скрытая), первая строка для заголовков
      if (indexY < arrangement.length - 1 && indexY !== 0) {
        valueY.forEach((valueX, indexX) => {
          // Игнорируем строку с заголовками
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
    summFormula += ')*0.001';
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

  /**
   * Получение объекта расчета данных и пользовательского ввода для сохранения расчетов
   */
  getSourceData(): any {
    return this.sourceDataObj;
  }

  // Заполнение с 6-ой колонки
  additionalFormulas(arrangement: [][]): void {
    console.log('***** additinoal formulas  for years *' );
    arrangement.forEach(item => {
      for (let i = 0; i <= 16 && item; i++) {
        // @ts-ignore
        item.push(' ');
      }
    });
    const summFormulas = [];
    // Добавляем столбцы расчета первого года
    arrangement.forEach((itemY, indexY) => {
      if (indexY > 0 && arrangement.length - 2 > indexY) { //
        itemY.forEach((itemX, indexX) => {
          // Для столбца G, первая формула
          if (indexX === 6) {
            // @ts-ignore
            arrangement[indexY][indexX] = `=D${indexY + 1}*(12/E${indexY + 1})`;
          } else if (indexX === 7) {

            // arrangement[indexY][indexX] = `=D${indexY + 1}*(12/E${indexY + 1})`;
            // @ts-ignore
            arrangement[indexY][indexX] = `=IF2(G${indexY + 1}+(D${indexY + 1}*(12/E${indexY + 1}))<D${indexY + 1},D${indexY + 1}*(12/E${indexY + 1}),D${indexY + 1}-D${indexY + 1}*(12/E${indexY + 1}))`;
          }

          if (indexX >= 6) {
            if (!summFormulas[indexY]) {
              summFormulas[indexX] = `=${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
            } else {
              summFormulas[indexX] += `+${this.formulaParser.indexToLetter(indexX)}${indexY + 1}`;
            }
          }
        });
      }
    });
    // Формулы сумм
    summFormulas.forEach((item, index) => {
      // @ts-ignore
      arrangement[arrangement.length - 1][index] = item;
    });

    console.log(arrangement);
  }
}
