export const hotSettings = {
  width: '100%',
  height: '100%',
  colHeaders: true,
  rowHeaders: true,
  formulas: true,
  manualRowResize: true,
  manualColumnResize: true,
  stretchH: 'all',
  minSpareRows: 1,
  contextMenu: {
    items: {
      remove_row: {
        name: 'Удалить строку' // Set custom text for predefined option
      }
    },
  },
  colWidths: [280, 280, 280, 280, 280, 280],
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

    // editable cells
    if (HandHelper.isNonEditable(row, col, prop)) {
      cellProperties.readOnly = true;
    }
    // else {
    //   cellProperties.className += ' h-green-cell h-white-font';
    // }
    // Установка стилей
    return cellProperties;
  },
};

class HandHelper {
  private static
  greenCells = [];
  private static
  blueCells = [];

  private static
  FontItalicCells = [];

  private static
  FontBoldCells = [
    {r: 0, c: 0},
    {r: 0, c: 1},
    {r: 0, c: 2},
    {r: 0, c: 3},
    {r: 0, c: 4},
    {r: 0, c: 5},
    {r: 0, c: 6}
  ];

  constructor() {
  }

  static

  isNonEditable(row, col, prop)
    :
    boolean {
    if (row === 0 || col === 0) { // Все заголовки нередактируемые Столбец идентификаторов нередактируемый
      return true;
    }
    return false;
  }

  static

  checkCustomClass(row, col, cellProperties)
    :
    void {
    // green
    if (this.greenCells.find(item => (item.r === row && item.c === col))
    ) {
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
