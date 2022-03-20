import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormulaParserService {
  filesRefGetter: any;

  private debug = false;

  constructor() { }

  /**
   * Перевод excel-подобного адреса в адресацию двумерного массива
   * @param excelCellAddress excel-подобный адрес ячейки, н-р: D21
   */
  getIndexses(excelCellAddress: string): { x: number, y: number } {
    const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // TODO переделать на регулярки
    return {
      x: alph.indexOf(excelCellAddress.trim()[0]),
      y: parseInt(excelCellAddress.trim().substr(1, excelCellAddress.trim().length - 1), 10) - 1
    };
  }

  /**
   * Перевод индекса в символ
   * @param index индекс строки в алфавите
   */
  indexToLetter(index: number): string {
    const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alph[index % alph.length];
  }


  /**
   * Основной метод расчета формул
   * @param dataForCalc Объект заполнения (предача по ссылке)
   * @param allowedIterations максимально разрешенное количество итерации при попытке расчета объекта
   * @param filesRefGetter  метод получения ссылок на объекты-страницы
   */
  parse(dataForCalc: Array<Array<any>>, allowedIterations: number, filesRefGetter?: (fileName) => {}): void {
    this.log('расчет');
    this.filesRefGetter = filesRefGetter;
    let formulaFind = true;
    let formulaCounter = 0;
    let counter = 0;


    while (formulaFind && counter < allowedIterations) {
      this.log({counter});
      formulaFind = false;
      formulaCounter = 0;
      counter++;
      for (let i = 0; i < dataForCalc.length; i++) {
        for (let j = 0; j < dataForCalc[i].length; j++) {
          const obj = dataForCalc[i][j];
          if (typeof obj === 'string' && obj.startsWith('=')) { // Найдена формула
            formulaCounter++;
            // try {
            formulaFind = true;
            // Если это условная формула
            // if (obj.startsWith('=IF2')) {
            //   this.log('условная формула');
            //   dataForCalc[i][j] = this.parseIfFormula2(obj, dataForCalc);
            // } else
            if (obj.startsWith('=IF')) {
              this.log('условная формула');
              dataForCalc[i][j] = this.parseIfFormula(obj, dataForCalc);
            } else if (obj.startsWith('=SPECIAL')) { // специальная формула
              const newf = this.special(obj, dataForCalc);
              this.log({newf});
              dataForCalc[i][j] = newf;
              this.log(dataForCalc[i][j]);
            } else if (obj.startsWith('=REF')) {    // Ссылка на другой объект
              dataForCalc[i][j] = this.parseRefFormula(obj);
            } else if (obj.startsWith('=LASTREF9')) {    // Ссылка на другой объект
              dataForCalc[i][j] = this.parseRefFormulaLast9(obj, dataForCalc);
            } else if (obj.startsWith('=LASTREFM')) {    // Ссылка на другой объект
              dataForCalc[i][j] = this.parseRefFormulaLastM(obj);
            } else if (obj.startsWith('=LASTREF')) {    // Ссылка на другой объект
              dataForCalc[i][j] = this.parseRefFormulaLast(obj);
            } else {
              // Парсим формулу
              const regex = /([\(\)\+\-\*\/])/;
              const a = obj.replace('=', '').split(regex);
              let invalid = false;
              // Перебираем формулу и расчитываем
              for (let k = 0; k < a.length; k++) {
                if (a[k] !== '' &&
                  a[k].startsWith('REF')) {
                  // console.log('+++++REF++++:' + a[k]);
                  a[k] = this.parseRefFormula('=' + a[k].replace('[', '(').replace(']', ')'));
                  // console.log('+++++REF++++:' + a[k]);
                } else if (a[k] !== '' &&
                  '+-*/()'.indexOf(a[k]) === -1 &&
                  isNaN(parseFloat(a[k]))) {
                  // console.log('+++++F++++:' + a[k]);
                  const addr = this.getIndexses(a[k]);
                  // this.log({a: a[k], addr, obj});
                  // Адрес зеркальный ввиду того что в первый массив - это строки
                  const cellValue = dataForCalc[addr.y][addr.x];
                  if (typeof cellValue === 'number' || !isNaN(parseFloat(cellValue))) { // && !cellValue.startsWith('=')) {
                    // @ts-ignore
                    a[k] = '(' + cellValue + ')';
                  } else {
                    invalid = true;
                    break;
                  }
                }
              }
              // заменяем формулу расчитанным значением
              if (!invalid) {
                // tslint:disable-next-line:no-eval
                dataForCalc[i][j] = Math.round(eval(a.join('')) * 1000) / 1000;
              }
            }
          }
        }
      }
      this.log({formulaCounter});
    }
  }

  /**
   * Метод расчета условной формулы
   * @param obj         "Объект" с формулой
   * @param dataForCalc Весь наобор данных для расчета
   */
  parseIfFormula(obj, dataForCalc): any {
    let retValue = obj;
    const substr = obj.substring(4, obj.indexOf(')')).split(',');
    // const substr = obj.substring(4, obj.lastIndexOf(')')).split(',');
    // Парсим условие
    const regex = /([\>\<])/;
    const a = substr[0].replace('=', '').split(regex);
    const addr = this.getIndexses(a[0]);
    // this.log({a: a[k], addr, obj});
    // Адрес зеркальный ввиду того что в первый массив - это строки
    const cellValue = dataForCalc[addr.y][addr.x];
    if (typeof cellValue === 'number') {
      a[0] = cellValue;
      // tslint:disable-next-line:no-eval
      if (eval(a.join(''))) {
        // Парсим формулу
        const regex1 = /([\(\)\+\-\*\/])/;
        const as = substr[1].replace('=', '').split(regex1);
        let invalid = false;
        // Перебираем формулу и расчитываем
        for (let k = 0; k < as.length; k++) {
          as[k] = as[k].trim();
          if (as[k] !== '' &&
            as[k].startsWith('REF')) {
            // console.log('+++++REF++++:' + as[k]);
            as[k] = this.parseRefFormula('=' + as[k].replace('[', '(').replace(']', ')').replace(';', ','));
            // console.log('+++++REF++++:' + as[k]);
          } else if (as[k] !== '' &&
            '+-*/()'.indexOf(as[k]) === -1 &&
            isNaN(parseFloat(as[k]))) {
            // console.log('********:' + as[k]);
            const addr1 = this.getIndexses(as[k]);
            // this.log({a: a[k], addr, obj});
            // Адрес зеркальный ввиду того что в первый массив - это строки
            const cellValue1 = dataForCalc[addr1.y][addr1.x];
            if (typeof cellValue1 === 'number'  || !isNaN(parseFloat(cellValue1))) { // && !cellValue.startsWith('=')) {
              // @ts-ignore
              as[k] = '(' + cellValue1 + ')';
            } else {
              invalid = true;
              break;
            }
          }
        }
        // заменяем формулу расчитанным значением
        if (!invalid) {
          // tslint:disable-next-line:no-eval
          retValue = Math.round(eval(as.join('')) * 100) / 100;
        }
      } else {
        retValue = substr[2];
      }
    }
    return retValue;
  }

  /**
   * Метод расчета специальной формулы:
   * Пр.1 (Найти Xs - Дисконтированный срок окупаемости)
   *  1. Ряд (Чистый дисконтированный накопленный доход, годы) = (Yi, Xi) (i от N1 до N16)
   *  2. Находим первый год Xk, где Yk>=0.
   *  3. Если k=N1 то Xs=1
   *  4. Если в интервале (N1,N2) нет Yk>=0 то Xs= "не окуп."
   *  5. Если Yk=0 (строго) то Xs=k-N1+1
   *  6. Если пп.3-5 не выполняется Xs=(k-N1+1)-Yk/(Yk-Y(k-1))
   * @param obj           "Объект" с формулой
   * @param dataForCalc   Весь набор данных для расчета
   */
  special(obj: string, dataForCalc: any): any {
    const di = 52;
    const yi = 18;
    let k = -1;
    let Xs;
    let Yk;
    const n1 = 1;
    this.log('special');
    // dataForCalc[53].forEach((item, index) => {  // 53 - индекс строки "чистый дисконтированный доход"
    for (let index = 2; index < dataForCalc[di].length; index++) {  // 53 - индекс строки "чистый дисконтированный доход", 2 - номер столбца
      const item = dataForCalc[di][index];
      if (item != null && typeof item !== 'number' && item.startsWith('=')) { // Еще не все посчитали
        return obj;
      } else if (item >= 0) {
        // k = dataForCalc[yi][index];        // 19 - индекс строки годы
        k = index - 1;        // 19 - индекс строки годы
        Yk = item;
        break;
      }
    }
    if (k === 1) {
      Xs = 1;
      return Xs;
    } else if (k === -1) {
      return 'не окуп.';
    } else if (Yk === 0) {
      Xs = k - n1 + 1;
      return Xs;
    } else {
      this.log('formula');
      this.log(`=(1+${this.indexToLetter(k + 1) + '' + (yi + 1)}-1)-${this.indexToLetter(k + 1) + '' + (di + 1)}/(${this.indexToLetter(k + 1) + '' + (di + 1)}-${this.indexToLetter(k) + '' + (di + 1)})`);
     // return `=(1+${this.indexToLetter(k + 1) + '' + (yi + 1)}-1)-${this.indexToLetter(k + 1) + '' + (di + 1)}/(${this.indexToLetter(k + 1) + '' + (di + 1)}-${this.indexToLetter(k) + '' + (di + 1)})`;
      return `=(1+${this.indexToLetter(k + 1) + '' + (yi + 1)}-C19+1-1)-${this.indexToLetter(k + 1) + '' + (di + 1)}/(${this.indexToLetter(k + 1) + '' + (di + 1)}-${this.indexToLetter(k) + '' + (di + 1)})`;
    }
  }

  /**
   * Метод расчета условной формулы
   * @param obj         "Объект" с формулой
   */
  parseRefFormula(obj): any {
    this.log('******** parseRefFormula *******');
    let retValue = obj;
    // =REF(file, indexRow, indexColumn)
    try {
      const tmpValue = retValue.substr(obj.indexOf('(') + 1, obj.indexOf(')') - obj.indexOf('(') - 1);
      const keysArray = tmpValue.split(',');
      if (this.filesRefGetter) {
        const otherData: [][] = this.filesRefGetter(keysArray[0]);
        // вот так должно было быть более правильно, но с*** мы же не ищем легких путей
        // retValue = otherData[keysArray[1], keysArray[2]];
        const indexes = this.getIndexses(keysArray[1]);
        this.log({otherData});
        retValue = otherData[indexes.y][indexes.x];
      }
    } catch (error) {
      retValue = 0;
    }
    return retValue;
  }

  /**
   * Получение последнего значения
   * @param obj
   */
  parseRefFormulaLast(obj): any {
    this.log('******** parseRefFormulaLast *******');
    let retValue = obj;
    try {
      const tmpValue = retValue.substr(obj.indexOf('(') + 1, obj.indexOf(')') - obj.indexOf('(') - 1);
      const keysArray = tmpValue.split(',');
      if (this.filesRefGetter) {
        const otherData: [][] = this.filesRefGetter(keysArray[0]);
        retValue = this.roundTo2Fix(otherData[otherData.length - 1][parseInt(keysArray[1], 10)]);
      }
    } catch (error) {
      retValue = 0;
    }
    return retValue;
  }

  /**
   * Получение значения последнй строки и умножение на последний параметр
   * @param obj
   */
  parseRefFormulaLastM(obj): any {
    this.log('******** parseRefFormulaLastM *******');
    let retValue = obj;
    try {
      const tmpValue = retValue.substr(obj.indexOf('(') + 1, obj.indexOf(')') - obj.indexOf('(') - 1);
      const keysArray = tmpValue.split(',');
      if (this.filesRefGetter) {
        const otherData: [][] = this.filesRefGetter(keysArray[0]);
        retValue = this.roundTo2Fix(otherData[otherData.length - 1][parseInt(keysArray[1], 10)] * parseFloat(keysArray[2]));
      }
    } catch (error) {
      retValue = 0;
    }
    return retValue;
  }

  /**
   * Специальная обработка для строки 9, да да привет сроки
   * @param obj
   */
  parseRefFormulaLast9(obj, dataForCalc: Array<Array<any>>): any {
    this.log('******** parseRefFormulaLast 9 *******');
    let retValue = obj;
    try {
      const tmpValue = retValue.substr(obj.indexOf('(') + 1, obj.indexOf(')') - obj.indexOf('(') - 1);
      const keysArray = tmpValue.split(',');
      if (this.filesRefGetter) {
        const otherData: [][] = this.filesRefGetter(keysArray[0]);
        const c27 = dataForCalc[26][parseInt(keysArray[1], 10)];
        retValue = otherData[otherData.length - 1][parseInt(keysArray[1], 10)];
        retValue = this.roundTo2Fix(retValue * c27 * 0.001);
      }
    } catch (error) {
      retValue = 0;
    }
    return retValue;
  }

  arrays2DCompare(arr1: any[][], arr2: any[][]): boolean{
    if (arr1.length !== arr2.length) { return false; }
    return arr1.every( (e, i) => {
      return e.every(sube => {
        this.log(`${arr2[i].includes(sube)} = ${sube}`);
        return arr2[i].includes(sube);
      });
    });
  }

  private log(log: any): void {
    if (this.debug) {
      console.log(log);
    }
  }

  // private calc(formula, dataForCalc: any): any {
  //   // Парсим формулу
  //   const regex1 = /([\(\)\+\-\*\/])/;
  //   const as = substr[1].replace('=', '').split(regex1);
  //   let invalid = false;
  //   // Перебираем формулу и расчитываем
  //   for (let k = 0; k < as.length; k++) {
  //     if (as[k] !== '' &&
  //       '+-*/()'.indexOf(as[k]) === -1 &&
  //       isNaN(parseFloat(as[k]))) {
  //       const addr1 = this.getIndexses(as[k]);
  //       // this.log({a: a[k], addr, obj});
  //       // Адрес зеркальный ввиду того что в первый массив - это строки
  //       const cellValue1 = dataForCalc[addr1.y][addr1.x];
  //       if (typeof cellValue1 === 'number') { //&& !cellValue.startsWith('=')) {
  //         // @ts-ignore
  //         as[k] = '(' + cellValue1 + ')';
  //       } else {
  //         invalid = true;
  //         break;
  //       }
  //     }
  //   }
  // }

  /**
   * Округление до второго знака
   * @param num значение для округления
   * @private
   */
  private roundTo2Fix(num: number, value = 100): number {
    return Math.round((num + Number.EPSILON) * value) / value;
  }
}
