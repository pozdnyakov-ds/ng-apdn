export const hotSettings = {
  width: '100%',
  height: '100%',
  colHeaders: true,
  rowHeaders: true,
  formulas: true,
  manualRowResize: true,
  manualColumnResize: true,
  colWidths: [41, 280, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
  mergeCells: [
    // { row: 15, col: 1, rowspan: 1, colspan: 18 },
    // { row: 17, col: 2, rowspan: 1, colspan: 16 }
  ],
  cells: (row, col, prop) => {
    // Установка свойств чтения/записи
    const cellProperties: any = {};
    if (!cellProperties.className) {
      cellProperties.className = '';
    }

    // other cells with custom class
    HandHelper.checkCustomClass(row, col, cellProperties);
    // массив с цифрами - номер колонки которые должны быть редактируемы
    if (row !== 0 && [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(col)) {
      cellProperties.className += ' h-green-cell h-white-font';
    } else {
      cellProperties.readOnly = true;
    }
    // Установка стилей
    return cellProperties;
  },
};

export const editableCells: Array<{r: number, c: number, value?: any}> = [
  {r: 1, c: 2}, {r: 2, c: 2}, {r: 3, c: 2}, {r: 4, c: 2}, {r: 5, c: 2}, {r: 6, c: 2},
  {r: 1, c: 3}, {r: 2, c: 3}, {r: 3, c: 3}, {r: 4, c: 3}, {r: 5, c: 3}, {r: 6, c: 3}
];

class HandHelper {
  private static greenCells = [ ];
  private static blueCells = [ ];

  private static FontItalicCells = [

  ];

  private static FontBoldCells = [
    {r: 0, c: 0},
    {r: 0, c: 1},
    {r: 0, c: 2},
    {r: 0, c: 3},
    {r: 0, c: 4},
    {r: 0, c: 5},
    {r: 8, c: 1},
    {r: 8, c: 3}
  ];

  constructor() {
    //
  }

  static isEditable(row, col, prop): boolean {
    if (editableCells.find(item => (item.r === row && item.c === col))) {
      return true;
    }
    return false;
  }

  static checkCustomClass(row, col, cellProperties): void {
    // green
    if (this.greenCells.find(item => (item.r === row && item.c === col))) {
      cellProperties.className += ' h-green-cell h-black-font';
    }
    if (this.blueCells.find(item => (item.r === row && item.c === col))) {
      cellProperties.className += ' h-blue-cell h-white-font';
    }
    if (this.FontItalicCells.find(item => (item.r === row && item.c === col))) {
      cellProperties.className += ' h-italic-font';
    }
    if (this.FontBoldCells.find(item => (item.r === row && item.c === col))) {
      cellProperties.className += ' h-bold-font';
    }
  }
}
