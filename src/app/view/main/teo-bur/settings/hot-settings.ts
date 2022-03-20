export const hotSettings = {
  width: '100%',
  height: '100%',
  colHeaders: true,
  rowHeaders: true,
  formulas: true,
  manualRowResize: true,
  manualColumnResize: true,
  colWidths: [41, 280, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 60, 60 ],
  mergeCells: [
    { row: 15, col: 1, rowspan: 1, colspan: 18 },
    { row: 17, col: 2, rowspan: 1, colspan: 16 }
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
      cellProperties.className += ' h-editable-cell h-white-font';
    }
    // Установка стилей
    return cellProperties;
  },
};

export const editableCells: Array<{
  prognozVal?: number;
  r: number, c: number, value?: any}> = [
  // {r: 2, c: 3},
  // {r: 3, c: 3},
  // {r: 4, c: 3},
  // {r: 5, c: 3},
  // {r: 6, c: 3},
  // {r: 7, c: 3},
  // {r: 8, c: 3},
  // {r: 9, c: 3},
  // {r: 10, c: 3},
  // {r: 11, c: 3},
  // {r: 12, c: 3},
  // {r: 13, c: 3},
  {r: 26, c: 2}, {r: 26, c: 3}, {r: 26, c: 4}, {r: 26, c: 5}, {r: 26, c: 6}, {r: 26, c: 7}, {r: 26, c: 8}, {r: 26, c: 9}, {r: 26, c: 10}, {r: 26, c: 11}, {r: 26, c: 12}, {r: 26, c: 13}, {r: 26, c: 14}, {r: 26, c: 15}, {r: 26, c: 16}, {r: 26, c: 17},
  {r: 27, c: 2}, {r: 27, c: 3}, {r: 27, c: 4}, {r: 27, c: 5}, {r: 27, c: 6}, {r: 27, c: 7}, {r: 27, c: 8}, {r: 27, c: 9}, {r: 27, c: 10}, {r: 27, c: 11}, {r: 27, c: 12}, {r: 27, c: 13}, {r: 27, c: 14}, {r: 27, c: 15}, {r: 27, c: 16}, {r: 27, c: 17},
  {r: 28, c: 2}, {r: 28, c: 3}, {r: 28, c: 4}, {r: 28, c: 5}, {r: 28, c: 6}, {r: 28, c: 7}, {r: 28, c: 8}, {r: 28, c: 9}, {r: 28, c: 10}, {r: 28, c: 11}, {r: 28, c: 12}, {r: 28, c: 13}, {r: 28, c: 14}, {r: 28, c: 15}, {r: 28, c: 16}, {r: 28, c: 17},
  {r: 32, c: 2}, {r: 32, c: 3}, {r: 32, c: 4}, {r: 32, c: 5}, {r: 32, c: 6}, {r: 32, c: 7}, {r: 32, c: 8}, {r: 32, c: 9}, {r: 32, c: 10}, {r: 32, c: 11}, {r: 32, c: 12}, {r: 32, c: 13}, {r: 32, c: 14}, {r: 32, c: 15}, {r: 32, c: 16}, {r: 32, c: 17},
  {r: 34, c: 2}, {r: 34, c: 3}, {r: 34, c: 4}, {r: 34, c: 5}, {r: 34, c: 6}, {r: 34, c: 7}, {r: 34, c: 8}, {r: 34, c: 9}, {r: 34, c: 10}, {r: 34, c: 11}, {r: 34, c: 12}, {r: 34, c: 13}, {r: 34, c: 14}, {r: 34, c: 15}, {r: 34, c: 16}, {r: 34, c: 17}
  // {r: 36, c: 2}, {r: 36, c: 3}, {r: 36, c: 4}, {r: 36, c: 5}, {r: 36, c: 6}, {r: 36, c: 7}, {r: 36, c: 8}, {r: 36, c: 9}, {r: 36, c: 10}, {r: 36, c: 11}, {r: 36, c: 12}, {r: 36, c: 13}, {r: 36, c: 14}, {r: 36, c: 15}, {r: 36, c: 16}, {r: 36, c: 17},
];

class HandHelper {
  private static greenCells = [
    {r: 5, c: 1}, {r: 5, c: 2}, /*{r: 5, c: 3},*/
    {r: 8, c: 1}, {r: 8, c: 2}, /*{r: 8, c: 3},*/
    {r: 9, c: 1}, {r: 9, c: 2}, /*{r: 9, c: 3},*/
    {r: 10, c: 1}, {r: 10, c: 2}, /*{r: 10, c: 3},*/
    {r: 12, c: 1}, {r: 12, c: 2}, /*{r: 12, c: 3},*/
    {r: 13, c: 1}, {r: 13, c: 2}, /*{r: 13, c: 3},*/
    /*{r: 14, c: 1}, {r: 14, c: 2},*/ /*{r: 14, c: 3},*/
  ];
  private static blueCells = [
    {r: 2, c: 1}, {r: 2, c: 2}, /*{r: 2, c: 3},*/
    {r: 3, c: 1}, {r: 3, c: 2}, /*{r: 3, c: 3},*/
    {r: 4, c: 1}, {r: 4, c: 2}, /*{r: 4, c: 3},*/
    {r: 7, c: 1}, {r: 7, c: 2}, /*{r: 7, c: 3},*/
    {r: 11, c: 1}, {r: 11, c: 2}, /*{r: 11, c: 3},*/
    {r: 31, c: 2}, {r: 31, c: 3}, {r: 31, c: 4}, {r: 31, c: 5}, {r: 31, c: 6}, {r: 31, c: 7}, {r: 31, c: 8}, {r: 31, c: 9}, {r: 31, c: 10}, {r: 31, c: 11}, {r: 31, c: 12}, {r: 31, c: 13}, {r: 31, c: 14}, {r: 31, c: 15}, {r: 31, c: 16}, {r: 31, c: 17},
    {r: 37, c: 2}, {r: 37, c: 3}, {r: 37, c: 4}, {r: 37, c: 5}, {r: 37, c: 6}, {r: 37, c: 7}, {r: 37, c: 8}, {r: 37, c: 9}, {r: 37, c: 10}, {r: 37, c: 11}, {r: 37, c: 12}, {r: 37, c: 13}, {r: 37, c: 14}, {r: 37, c: 15}, {r: 37, c: 16}, {r: 37, c: 17},
    {r: 38, c: 2}, {r: 38, c: 3}, {r: 38, c: 4}, {r: 38, c: 5}, {r: 38, c: 6}, {r: 38, c: 7}, {r: 38, c: 8}, {r: 38, c: 9}, {r: 38, c: 10}, {r: 38, c: 11}, {r: 38, c: 12}, {r: 38, c: 13}, {r: 38, c: 14}, {r: 38, c: 15}, {r: 38, c: 16}, {r: 38, c: 17},
    {r: 39, c: 2}, {r: 39, c: 3}, {r: 39, c: 4}, {r: 39, c: 5}, {r: 39, c: 6}, {r: 39, c: 7}, {r: 39, c: 8}, {r: 39, c: 9}, {r: 39, c: 10}, {r: 39, c: 11}, {r: 39, c: 12}, {r: 39, c: 13}, {r: 39, c: 14}, {r: 39, c: 15}, {r: 39, c: 16}, {r: 39, c: 17},
  ];

  private static FontItalicCells = [
    {r: 19, c: 1}, {r: 24, c: 1}, {r: 25, c: 1}, {r: 52, c: 1}, {r: 53, c: 1}, {r: 54, c: 1}
  ];

  private static FontBoldCells = [
    {r: 19, c: 1}, {r: 24, c: 1}, {r: 25, c: 1}, {r: 52, c: 1}, {r: 53, c: 1}, {r: 54, c: 1}, {r: 61, c: 1}, {r: 62, c: 1}, {r: 15, c: 1},
    {r: 17, c: 2},
    {r: 18, c: 2},
    {r: 18, c: 3},
    {r: 18, c: 4},
    {r: 18, c: 5},
    {r: 18, c: 6},
    {r: 18, c: 7},
    {r: 18, c: 8},
    {r: 18, c: 9},
    {r: 18, c: 10},
    {r: 18, c: 11},
    {r: 18, c: 12},
    {r: 18, c: 13},
    {r: 18, c: 14},
    {r: 18, c: 15},
    {r: 18, c: 16},
    {r: 18, c: 17},
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
