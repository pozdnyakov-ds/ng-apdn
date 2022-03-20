export const hotSettings = {
  width: '100%',
  height: '100%',
  colHeaders: true,
  rowHeaders: true,
  formulas: true,
  manualRowResize: true,
  manualColumnResize: true,
  colWidths: [280, 80, 80, 80, 80, 80],
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
    if (!HandHelper.isEditable(row, col, prop)) {
      cellProperties.readOnly = true;
    } else {
      cellProperties.className += ' h-green-cell h-white-font';
    }
    // Установка стилей
    return cellProperties;
  },
};

export const editableCells: Array<{r: number, c: number, value?: any}> = [
  {r: 1, c: 2}, {r: 2, c: 2}, {r: 3, c: 2},
  {r: 1, c: 3}, {r: 2, c: 3}, {r: 3, c: 3},
  {r: 1, c: 4}, {r: 2, c: 4}, {r: 3, c: 4},
  {r: 1, c: 5}, {r: 2, c: 5}, {r: 3, c: 5},
  {r: 1, c: 6}, {r: 2, c: 6}, {r: 3, c: 6},
  {r: 1, c: 7}, {r: 2, c: 7}, {r: 3, c: 7},
  {r: 1, c: 8}, {r: 2, c: 8}, {r: 3, c: 8},
  {r: 1, c: 9}, {r: 2, c: 9}, {r: 3, c: 9},
  {r: 1, c: 10}, {r: 2, c: 10}, {r: 3, c: 10},
  {r: 1, c: 11}, {r: 2, c: 11}, {r: 3, c: 11},
  {r: 1, c: 12}, {r: 2, c: 12}, {r: 3, c: 12},
  {r: 1, c: 13}, {r: 2, c: 13}, {r: 3, c: 13},
  {r: 1, c: 14}, {r: 2, c: 14}, {r: 3, c: 14},
  {r: 1, c: 15}, {r: 2, c: 15}, {r: 3, c: 15},
  {r: 1, c: 16}, {r: 2, c: 16}, {r: 3, c: 16},
  {r: 1, c: 17}, {r: 2, c: 17}, {r: 3, c: 17},
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
    {r: 0, c: 6},
    {r: 0, c: 7},
    {r: 0, c: 8},
    {r: 0, c: 9},
    {r: 0, c: 10},
    {r: 0, c: 11},
    {r: 0, c: 12},
    {r: 0, c: 13},
    {r: 0, c: 14},
    {r: 0, c: 15},
    {r: 0, c: 16},
    {r: 0, c: 17},
    {r: 8, c: 1},
    {r: 8, c: 3}
  ];

  constructor() {}

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
