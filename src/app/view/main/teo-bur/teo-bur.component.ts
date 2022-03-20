import {Component, Input, ViewChild} from '@angular/core';
import * as Handsontable from 'handsontable';
import {HotTableRegisterer} from '@handsontable/angular';
import {clearData} from './example-data/clearData';
// import {data as fData} from './example-data/fData';
// import {teoData as fData} from './settings/teo-static-data';
import {CommonDataService, Field, OE, Well} from '../../../services/common-data.service';
import {editableCells, hotSettings} from './settings/hot-settings';
import {ValuesService} from 'src/app/services/values.service';
import {PrognozService} from 'src/app/services/prognoz.service';
import {FormulaParserService} from '../../../services/formula-parser.service';
import {AmortizationService, DictionaryItem} from '../../../services/amortization.service';
import {NewWell, NewWellDialogComponent} from './new-well-dialog/new-well-dialog.component';
import {AlertComponent, YesNo} from '../../../components/alert/alert.component';
import {CalcPanelComponent} from './calc-panel/calc-panel.component';
import {AmortExpensesPageComponent} from './amort-expenses-page/amort-expenses-page.component';
import {Page} from '../../../components/main-dialog/main-dialog.component';
import {DatePipe} from '@angular/common';
import {AmortDeductionEquipmentPageComponent} from './amort-deduction-equipment-page/amort-deduction-page.component';
import {PrognozServiceNewWell} from 'src/app/services/prognozNewWell.service';
import {CalcObj} from '../../../services/user-storage.service';
import {Apdn2Service} from '../../../services/apdn2.service';
import {UtilService} from '../../../services/util.service';
import {EkonPageComponent} from './ekon-page/ekon-page.component';
import {YearCounterService} from '../../../services/year-counter/year-counter.service';
import {YearCounter141Service} from '../../../services/year-counter/year-counter-14-1.service';

@Component({
  selector: 'app-teo-bur',
  templateUrl: './teo-bur.component.html',
  styleUrls: ['./teo-bur.component.styl']
})
export class TeoBurComponent {

  private isWasError = false;

  @Input() set firstTableData(value: Array<any>) {
    this.fta.forEach((item, index) => {
      if (value && value[index] && value[index].INP_DATA) {
        clearData[item.r][item.c] = parseFloat(value[index].INP_DATA);
        this.dataForCalc[item.r][item.c] = parseFloat(value[index].INP_DATA);
      }
    });
    if (this.hotRegisterer.getInstance(this.id)) {
      this.hotRegisterer.getInstance(this.id).loadData(clearData);
    }
  }

  constructor(private commonService: CommonDataService,
              private formulaParser: FormulaParserService,
              private amortizationService: AmortizationService,
              private valuesService: ValuesService,
              private prognozService: PrognozService,
              private prognozServiceNewWell: PrognozServiceNewWell,
              private apdn2Service: Apdn2Service,
              private utilService: UtilService,
              private yc: YearCounterService,
              private yc14: YearCounter141Service
  ) {
    const asyncWrap = async () => {
      this.fData = await this.amortizationService.getTeoData();
      this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
    };
    asyncWrap();
  }

  @ViewChild('newWellDlg') newWellDialog: NewWellDialogComponent;
  @ViewChild('alert') alert: AlertComponent;
  @ViewChild('calcPanel') calcPanel: CalcPanelComponent;

  /** Обустройство */
    // @ViewChild('amortDeductArrangementPage') amortDeductArrangementPage: AmortDeductionArrangementPageComponent;
  @ViewChild('amortDeductArrangementPage') amortDeductArrangementPage: AmortDeductionEquipmentPageComponent;
  /** Обьорудование */
  @ViewChild('amortDeductEquipmentPage') amortDeductEquipmentPage: AmortDeductionEquipmentPageComponent;
  /** Переменные расходы */
  @ViewChild('expensesPage') expencesPage: AmortExpensesPageComponent;
  /** Экономические показатели */
  @ViewChild('econIndicatorsPage') econIndicatorsPage: EkonPageComponent;
  /** Экономические нормативы */
  @ViewChild('econStandardPage') econStandardPage: EkonPageComponent;

  private readonly OIL_ROW_INDEX_FOR_PROGNOZ = 26;

  // Скважины
  wellsDs: Array<Well>;
  // Выбранные скважины
  selectedWell: Well;

  types: Array<{ type: number, name: string }> = [{type: 2, name: 'Пробуренная'}, {type: 1, name: 'Новая'}];
  selectedType: { type: number, name: string };

  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  // Объект с исходными данными и формулами из сервиса
  fData: any;
  data: any = clearData;
  // @ts-ignore
  hotSettings: Handsontable.GridSettings = {
    data: this.data,
    afterChange: (changes) => {
      console.log('copy editable cells');
      this.calcObject.editableCells = [];
      this.utilService.copyAllEditableCells( this.data, this.calcObject.editableCells);
      console.log('calc object');
      console.log(this.calcObject);
    },
    ...hotSettings
  };

  private field: Field;
  private oe: Array<OE>;
  isFirstFill = true;
  dataForCalc: any;

  fta: Array<{ r: number; c: number; }> =
    [{r: 2, c: 3},
      {r: 3, c: 3},
      {r: 4, c: 3},
      {r: 5, c: 3},
      {r: 6, c: 3},
      {r: 7, c: 3},
      {r: 8, c: 3},
      {r: 9, c: 3},
      {r: 10, c: 3},
      {r: 11, c: 3},
      {r: 12, c: 3},
      {r: 13, c: 3}];

  pages: Array<{ name: string; code: string }> = [{name: 'ТЭО Бурение скважины', code: '1'},
    {name: 'Капитальные вложения (обустройство)', code: '2'},
    {name: 'Капитальные вложения (оборудование)', code: '3'},
    {name: 'Переменные расходы', code: '4'},
    {name: 'Экономические показатели', code: '5'},
    {name: 'Экономические нормативы', code: '6'},
  ];

  private dictiObor: Array<DictionaryItem> = [];
  show: { name: string; code: string } = this.pages[0];
  typeIsEnabled = false;
  // был ли расчет прогноза
  private isPrognoz = false;

  @Input() page: Page;
  /** Объект с данными расчета для сохранения */
  calcObject: CalcObj = {
    arrangement: undefined,
    econIndicators: undefined,
    econNormatives: undefined,
    equipment: undefined,
    expenses: undefined,
    // teoBur: undefined
    editableCells: undefined
  };

  private chekStatusAndAlert = (result) => {
    if (result && result.status) {
      this.alert.show(result.status);
    } else {
      this.alert.show(JSON.stringify(result));
    }
  }

  saveData(): void {
    console.log({data: this.hotRegisterer.getInstance(this.id).getData()});
  }

  /**
   * Обработчки изменения типа скважины - "новая", "пробуренная"
   */
  async typeChange(): Promise<void> {
    console.log('get wells');
    if (!this.valuesService.isNew()) {
      // Выборка уже пробуренных скважин
      this.wellsDs = await this.commonService.getExistingWells(
        this.valuesService.getField().MEST_CODE,
        (this.valuesService.getOE()) ? this.valuesService.getOE().map(item => item.HOR_CODE).join(',') : '',
        this.valuesService.getMnk().CODE_ORG,
        // this.selectedType.type,
        (this.valuesService.isNew()) ? 1 : 2,
        this.valuesService.getActualPeriod());
    } else {
      // Выборка новых скважин
      this.wellsDs = await this.commonService.getNewWells(
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getMnk().CODE_ORG
      );
      this.wellsDs = this.wellsDs.map(item => {
        item.WELL_NAME = item.STRUCT_NUM;
        item.WELL_ID = item.ID;
        return item;
      });
      console.log({wells: this.wellsDs});
    }
  }

  calculate(isAuto = false): void {
    // Пересчат данных страниц, с учетом ввода пользователя
    this.amortDeductArrangementPage.recalc();
    this.amortDeductEquipmentPage.recalc();
    this.expencesPage.recalc();

    console.log('calculate');
    const oe = this.valuesService.getOE();
    let oes = '';
    if (oe) {
      oes = oe.map(e => e.HOR_CODE).join(',');
    }
    const well = this.valuesService.getWell();
    /*if (well && oes){
      this.prognozService.run(well.WELL_ID, oes, null, null);
    }else{
      this.alert.show('Необходимо выбрать скважину и ЭО');
    }*/
    //
    if (this.isPrognoz && isAuto) {
        editableCells.forEach((item, index) => {
          if (this.isPrognoz && item.r === this.OIL_ROW_INDEX_FOR_PROGNOZ) {
            // item.value = parseFloat(this.dataForCalc[item.r][item.c]);
            if (item.r === 26) {
              // item.value = parseFloat(this.hotRegisterer.getInstance(this.id).getData()[item.r][item.c]);
              item.prognozVal = parseFloat(this.dataForCalc[item.r][item.c]);
            }
          }
        });
        // this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
        // editableCells.forEach((item, index) => {
        //   if (this.isPrognoz && item.r === this.OIL_ROW_INDEX_FOR_PROGNOZ) {
        //     if (item.r === 26) {
        //       this.dataForCalc[item.r][item.c] = item.value;
        //     }
        //   }
        // });
      }
    // Адрес ячейки бурения
    const burAddress = {r: 2, c: 3};
    // Сохраняем значение бурения
    const burValue = parseFloat(this.hotRegisterer.getInstance(this.id).getData()[burAddress.r][burAddress.c]);
    // if (!this.isFirstFill) { // Если это не первый расчет, нужно сохранить данные из редактируемых ячеек и подменить их в оригинале
    console.log('... не первый расчет ...');
    editableCells.forEach(item => {
      try {
        // item.value = parseFloat(this.dataForCalc[item.r][item.c]);
        item.value = parseFloat(this.hotRegisterer.getInstance(this.id).getData()[item.r][item.c]);
      } catch (error) {
        item.value = 0;
      }
    });
    this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
    editableCells.forEach(item => {
      if (this.isPrognoz && item.prognozVal !== undefined) {
        this.dataForCalc[item.r][item.c] = item.prognozVal;
      } else {
        this.dataForCalc[item.r][item.c] = item.value;
      }
    });
    this.isPrognoz = false;
    this.yc.calculationInit(this.amortDeductArrangementPage.getCalculatedData(), this.amortDeductEquipmentPage.getCalculatedData());
    // } else {
    //   // Был прогноз, нужно сохранить прогнозные ячейки
    // if (this.isPrognoz && isAuto) {
    //   editableCells.forEach((item, index) => {
    //     if (this.isPrognoz && item.r === this.OIL_ROW_INDEX_FOR_PROGNOZ) {
    //       // item.value = parseFloat(this.dataForCalc[item.r][item.c]);
    //       if (item.r === 26) {
    //         // item.value = parseFloat(this.hotRegisterer.getInstance(this.id).getData()[item.r][item.c]);
    //         item.value = parseFloat(this.dataForCalc[item.r][item.c]);
    //       }
    //     }
    //   });
    //   this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
    //   editableCells.forEach((item, index) => {
    //     if (this.isPrognoz && item.r === this.OIL_ROW_INDEX_FOR_PROGNOZ) {
    //       if (item.r === 26) {
    //         this.dataForCalc[item.r][item.c] = item.value;
    //       }
    //     }
    //   });
    //   this.isFirstFill = false;
    // }
    // else {
    //     // Прогноза не было подставляем все как есть
    //     this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
    this.isFirstFill = false;
    //   }
    // }
    // Воостановление значения бурения
    this.dataForCalc[burAddress.r][burAddress.c] = burValue;
    // Расчет
    this.formulaParser.parse(this.dataForCalc, 60, (fileName) => {
      switch (fileName) {
        case 'equipt': {
          return this.amortDeductEquipmentPage.getCalculatedData();
        }
        case 'arrangement': {
          return this.amortDeductArrangementPage.getCalculatedData();
        }
        case 'expenses': {
          return this.expencesPage.getCalculatedData();
        }
        case 'econst': {
          return this.econStandardPage.getCalculatedData();
        }
        case 'econind': {
          return this.econIndicatorsPage.getCalculatedData();
        }
        case 'YCOBOR': {
          return this.yc.obor();
        }
        case 'YCOBUSTR': {
          return this.yc.obustr();
        }
        case 'YCOBORFULL': {
          return this.yc.oborFull();
        }
        case 'YCOBUSTRFULL': {
          return this.yc.obustrFull();
        }
        case 'AMORT14': {
          /**
           * 12:3 - ячейка срока амортизации
           * 2:3 - стоимость бурения
           */
          return this.yc14.calculate14(parseFloat(this.dataForCalc[10][3]), parseFloat(this.dataForCalc[2][3]));
        }
        default: {
          return [];
        }
      }
    });
    this.hotRegisterer.getInstance(this.id).loadData(this.dataForCalc);
    // Сохранение объектов расчета
    console.log('***** Сохранение объектов расчета *****');
    this.calcObject.econNormatives = this.econStandardPage.getSourceData();
    this.calcObject.econIndicators = this.econIndicatorsPage.getSourceData();
    this.calcObject.expenses = this.expencesPage.getSourceData();
    this.calcObject.arrangement = this.amortDeductArrangementPage.getSourceData();
    this.calcObject.equipment = this.amortDeductEquipmentPage.getSourceData();
  }

  /**
   * Заполнение данными страниц Переменные расходы, Обустройство и Оборудование
   */
  async getAmortizationData(): Promise<void> {
    /** Смена скважины - обнуляем признак ошибки */
    this.isWasError = false;
    this.utilService.clearEditableCells(this.dataForCalc);
    this.utilService.clearEditableCells(this.fData);
    this.utilService.clearEditableCells(this.data);
    // Смена скважины - возврат объекта с формулами
    // this.dataForCalc = JSON.parse(JSON.stringify(this.fData));
    // this.hotRegisterer.getInstance(this.id).loadData(this.dataForCalc);
    console.log({wells: this.selectedWell});
    this.valuesService.setWell(this.selectedWell);

    this.calcPanel.init();

    // Установка значений для данных которые будут использоваться в расчете
    this.utilService.fillWellName(this.dataForCalc, this.selectedWell.WELL_NAME);
    // Установка значений в clearData для текущего отображения
    this.utilService.fillWellName(this.data, this.selectedWell.WELL_NAME);
    // Установка в объект с формулами
    this.utilService.fillWellName(this.fData, this.selectedWell.WELL_NAME);

    this.isFirstFill = true;
    // Обновляем панельку с расчетами по скважине
    this.calcPanel.init();
    // Объект для сохранения переменных расходов
    this.calcObject = {
      arrangement: undefined,
      econIndicators: undefined,
      econNormatives: undefined,
      equipment: undefined,
      expenses: undefined,
      // teoBur: undefined
      editableCells: undefined
    };
    let message = '';

    try {
      // Переменные расходы
      // const getPeremRasch = await this.apdn2Service.getPeremRasch('607', '0', '0', '1', '2021');
      const getPeremRasch = await this.apdn2Service.getPeremRasch(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log({getPeremRasch});
      if (!getPeremRasch) {
        message += '<br/> Данные для Экономических показателей не найдены';
      }
      const peremRash2D = this.utilService.convertToTwoDimensional(getPeremRasch, {
        NO_PP: '№',
        NAME: 'Статья расходов (руб./т)',
        VAL: 'Стоимость, руб.',
        APPLY: 'Учитывать',
        SROK: 'Срок амортизации, мес.',
        YEARS_COST: 'Год затрат'
      });
      // Сохранения в объекте расчета
      this.calcObject.expenses = peremRash2D;
      this.expencesPage.fillTableData(peremRash2D);
      // Установка заголовка с годами
      // Установка значений для данных которые будут использоваться в расчете
      this.utilService.fillYearsHeader(this.dataForCalc, peremRash2D);
      // Установка значений в clearData для текущего отображения
      this.utilService.fillYearsHeader(this.data, peremRash2D);
      // Установка в объект с формулами
      this.utilService.fillYearsHeader(this.fData, peremRash2D);

    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "Переменные расходы"';
      console.log('Ошибка расчета для ПЕРЕМЕННЫХ РАСХОДОВ');
    }

    try {
      // Исходные экономические показатели для вкладки "ТЕО бурения"
      // const newTeoBurData = await this.apdn2Service.getParamTeo('607', '0', '0', '1', '2021');
      const newTeoBurData = await this.apdn2Service.getParamTeo(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log('***** данные для основной страницы *****');
      console.log({newTeoBurData});
      if (!newTeoBurData) {
        message += '<br/> Данные для ТЭО Бурения отсутстуют';
      }
      // Установка значений для данных которые будут использоваться в расчете
      this.utilService.fillTeoData(this.dataForCalc, newTeoBurData);
      // Установка значений в clearData для текущего отображения
      this.utilService.fillTeoData(this.data, newTeoBurData);
      // Установка в объект с формулами
      this.utilService.fillTeoData(this.fData, newTeoBurData);
      // Сохранения в объекте расчета
      // this.calcObject.teoBur = this.fData;
      // this.calcObject.teoBur = {
      //     dataForCalc: this.dataForCalc,
      //     fData: this.fData,
      //     data: this.data
      //   };

      this.hotRegisterer.getInstance(this.id).loadData(this.data);
    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "ТЭО Бурения"';
      console.log('Неудачный расчет для исходных экономических показателей');
    }
    try {
      // Оборудование, кап вложения
      // const getObor = await this.apdn2Service.getObor('607', '0', '0', '1', '2021');
      const getObor = await this.apdn2Service.getObor(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log({getObor});
      const obor2d = this.utilService.convertToTwoDimensional(getObor, {
        NO_PP: '№',
        NAME: 'Показатель',
        VAL: 'Стоимость, руб.',
        APPLY: 'Учитывать',
        SROK: 'Срок амортизации, мес.',
        YEARS_COST: 'Год затрат'
      });
      if (this.isFirstFill) {
        this.yc.calculationObor(obor2d);
      }
      if (!getObor) {
        message += '<br/> Ошибка в формате данных для Капитальных вложени (оборудование) не найдены';
      }
      // Сохранения в объекте расчета
      this.calcObject.equipment = obor2d;
      this.amortDeductEquipmentPage.fillTableData(obor2d, this.valuesService.isNew());
    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "Капитальных вложени (оборудование)"';
      console.log('Ошибка расчета для ОБОРУДОВАНИЯ');
    }

    try {
      // Обустройство, кап вложения
      // const getObustr = await this.apdn2Service.getObustr('607', '0', '0', '1', '2021');
      const getObustr = await this.apdn2Service.getObustr(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log({getObustr});
      if (!getObustr) {
        message += '<br/> Данные для Капитальных вложений (обустройство) не найдены';
      }
      const obustr2d = this.utilService.convertToTwoDimensional(getObustr, {
        NO_PP: '№',
        NAME: 'Показатель',
        VAL: 'Стоимость, руб.',
        APPLY: 'Учитывать',
        SROK: 'Срок амортизации, мес.',
        YEARS_COST: 'Год затрат'
      });
      if (this.isFirstFill) {
        this.yc.calculationObustr(obustr2d);
      }
      // Сохранения в объекте расчета
      this.calcObject.arrangement = obustr2d;
      this.amortDeductArrangementPage.fillTableData(obustr2d, this.valuesService.isNew());
    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "Капитальных вложений (обустройство)"';
      console.log('Ошибка расчета для ОБУСТРОЙСТВА');
    }

    try {
      // Экономические показатели
      // const getParamTeo = await this.apdn2Service.getTeoBur('607', '0', '0', '1', '2021');
      const getParamTeo = await this.apdn2Service.getIEP(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log({getParamTeo});
      if (!getParamTeo) {
        message += '<br/> Данные для "Экономические показатели" не найдены';
      }
      const paramTeo2d = this.utilService.convertToTwoDimensional(getParamTeo, {
        NO_PP: '№',
        NAME: 'Показатели (руб./т)',
        VAL: 'Стоимость, руб.',
        APPLY: 'Учитывать',
        SROK: 'Срок амортизации, мес.',
        YEARS_COST: 'Год затрат'
      });
      // Сохранения в объекте расчета
      this.calcObject.econIndicators = paramTeo2d;
      this.econIndicatorsPage.fillTableData(paramTeo2d);
    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "Экономические показатели"';
      console.log('Ошибка расчета для ЭКОНОМИЧЕСКИХ НОРМАТИВОВ');
    }

    try {
      // Экономические нормативы
      // const getNorm = await this.apdn2Service.getNormativ('607', '0', '0', '1', '2021');
      // const getNorm = await this.apdn2Service.getNormativ(this.valuesService.getMnk().CODE_ORG,
      const getNorm = await this.apdn2Service.getNormativ2(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        this.valuesService.getWell().WELL_NAME,
        (this.valuesService.isNew()) ? '1' : '0',
        '2021');
      console.log({getNorm});
      if (!getNorm) {
        message += '<br/> Данные для Экономических нормативов не найдены';
      }
      const paramTeo2d = this.utilService.convertToTwoDimensional(getNorm, {
        NO_PP: '№',
        NAME: 'Параметры ( % )',
        VAL: 'Стоимость, руб.',
        APPLY: 'Учитывать',
        SROK: 'Срок амортизации, мес.',
        YEARS_COST: 'Год затрат'
      });
      // Сохранения в объекте расчета
      this.calcObject.econNormatives = paramTeo2d;
      this.econStandardPage.fillTableData(paramTeo2d);
    } catch (error) {
      message += '<br/> Ошибка в формате/данные не полные для "Экономические нормативы"';
      console.log('Ошибка расчета для ЭКОНОМИЧЕСКИХ ПОКАЗАТЕЛЕЙ');
    }


    if (message.trim().length > 0) {
      this.alert.show(message);
      this.clearAreas();
      this.isWasError = true;
    } else {
      this.isWasError = false;
    }
    // setTimeout(() => {
    //   this.calcPanel.init();
    // }, 100);
  }

  /**
   * Обработчик удаления скважины
   */
  async removeWell(): Promise<void> {
    if (this.selectedWell) {
      this.alert.showConfirm('Удаление скважины',
        `Вы действительно хотите удалить скважину ${this.selectedWell.WELL_NAME}?`,
        async (value) => {
          if (value === YesNo.yes) {
            let result = null;
            console.log('delete new well');
            try {
              if (!this.valuesService.isNew()) {
                result = await this.commonService.removeWell(this.selectedWell.WELL_ID);
                // result = await this.commonService.removeWell(this.selectedWell.WELL_NAME);
              } else {
                result = await this.commonService.removeNewWell(this.selectedWell.WELL_ID);
                // result = await this.commonService.removeNewWell(this.selectedWell.WELL_NAME);
              }
            } catch (e) {
              console.log('empty result');
            }
            // Обнуляем выбор скважины
            this.selectedWell = null;
            this.clearAreas();
            // Обновление списка скважин
            this.typeChange();
            // this.chekStatusAndAlert('Cкважина удалена.');
          }
        });
    }
  }

  /**
   * Добавление новой скважины
   * @param $event наименование новой скважины
   */
  async addNewWell($event: NewWell): Promise<void> {
    const datePipe = new DatePipe('ru-RU');
    const procRez = await this.commonService.checkNewWell(this.valuesService.getMnk().CODE_ORG,
      this.valuesService.getField().MEST_CODE,
      $event.wellName);
    if (parseInt(procRez[0].WELLS_COUNT, 10) === 0) {
      await this.commonService.addNewWell(this.valuesService.getMnk().CODE_ORG,
        this.valuesService.getField().MEST_CODE,
        $event.wellName,
        datePipe.transform($event.explDate, 'dd.MM.yyyy'),
        $event.udZap.toString(),
        $event.debitLiqui.toString(),
        $event.nachObvod.toString(),
        $event.koeffEkspl.toString(),
        $event.stoimostBur.toString(),
        $event.srokAmort.toString()
      );
      // Обновление списка скважин
      this.typeChange();
    } else {
      this.alert.show('Скважина уже существует.');
    }
  }

  /**
   * Оповещение о необходимости инициализации выборки скважин
   * @param isEnabled
   */
  emitForWells(isEnabled: boolean): void {
    console.log('emitForWells;');
    this.typeIsEnabled = isEnabled;
    this.isFirstFill = true;
    this.selectedWell = undefined;
    this.valuesService.setWell(undefined);
    if (isEnabled) {
      this.typeChange();
    }
  }

  clearAreas(): void {
    console.log('clear areas');
    // очистка областей
    this.amortDeductEquipmentPage.clear();
    this.amortDeductArrangementPage.clear();
    this.expencesPage.clear();
    this.econIndicatorsPage.clear();
    this.econStandardPage.clear();

    this.utilService.clearEditableCells(this.dataForCalc);
    this.utilService.clearEditableCells(this.fData);
    this.utilService.clearEditableCells(this.data);

    // Установка значений для данных которые будут использоваться в расчете
    this.utilService.fillTeoClearData(this.dataForCalc);
    // Установка значений в clearData для текущего отображения
    this.utilService.fillTeoClearData(this.data);
    // Установка в объект с формулами
    this.utilService.fillTeoClearData(this.fData);

    // Установка значений для данных которые будут использоваться в расчете
    // this.utilService.clearPrognoz(this.dataForCalc);
    // // Установка значений в clearData для текущего отображения
    // this.utilService.clearPrognoz(this.data);
    // // Установка в объект с формулами
    // this.utilService.clearPrognoz(this.fData);

    // Установка значений в clearData для текущего отображения
    this.utilService.fillWellName(this.data, '00000');
    this.hotRegisterer.getInstance(this.id).loadData(this.data);
  }

  /**
   * расчет прогноза
   */
  async prognoz(): Promise<void> {
    this.utilService.copyAllEditableCells(this.data, this.dataForCalc);
    this.utilService.copyAllEditableCells(this.data, this.fData);
    // Установка значений для данных которые будут использоваться в расчете
    this.utilService.clearPrognoz(this.dataForCalc);
    // Установка значений в clearData для текущего отображения
    this.utilService.clearPrognoz(this.data);
    // Установка в объект с формулами
    this.utilService.clearPrognoz(this.fData);

    console.log('prognoz');

    const well = this.valuesService.getWell();
    const mest = this.valuesService.getField();


    if (this.page.isNewWell === true) {
      const org = this.valuesService.getMnk();
      const prognozValue = await this.prognozServiceNewWell.run(well.WELL_NAME, org.CODE_ORG, mest.MEST_CODE);
      if (prognozValue) {
        // Индексы ячейки добычи нефти
        const oilRowIndex = 26;
        let oilColumnIndex = 2;
        for (let index = 0; index < Math.min(prognozValue.length, 16); index++) {
          const item = prognozValue[index];
          // this.data[oilRowIndex][oilColumnIndex] = Math.round(item.prodoil);
          this.dataForCalc[oilRowIndex][oilColumnIndex] = Math.round(item.prodoil);
          oilColumnIndex++;
        }
        this.isPrognoz = true;
      }
    } else {
      //  Ячейка С19 (18;2) - адрес ячейки даты начала бурения (в таблице - первая запись)
      let firstYear = parseInt(this.dataForCalc[18][2], 10);
      let oes = '';
      const oe = this.valuesService.getOE();
      if (oe) {
        oes = oe.map(e => e.HOR_CODE).join(',');
      }
      if (well && oes) {
        const prognozValue = await this.prognozService.run(well.WELL_ID, oes, null, null);
        if (prognozValue) {
          // Индексы ячейки добычи нефти
          let oilColumnIndex = 2;
          const currentDate = new Date();
          if (this.isWasError) {
            firstYear = 2100;
          }
            // tslint:disable-next-line:prefer-for-of
          for (let index = 0, prognozIndex = 0; index < Math.min(prognozValue.length, 16); index++) {
              const item = prognozValue[prognozIndex];

              if (item.t <= firstYear) {
                // this.data[this.OIL_ROW_INDEX_FOR_PROGNOZ][oilColumnIndex] = Math.round(item.prodoil * 100) / 100;
                this.dataForCalc[this.OIL_ROW_INDEX_FOR_PROGNOZ][oilColumnIndex] = Math.round(item.prodoil * 100) / 100;
                oilColumnIndex++;
                prognozIndex++;
              } else {
                this.dataForCalc[this.OIL_ROW_INDEX_FOR_PROGNOZ][oilColumnIndex] = 0;
                oilColumnIndex++;
              }
              firstYear++;
            }
          if (this.isWasError) { // Данных нет - заполняем шапку датами из прогноза

            for (let index = 0; index < Math.min(prognozValue.length, 16); index++) {
              this.dataForCalc[18][index + 2] = prognozValue[index].t;
              this.fData[18][index + 2] = prognozValue[index].t;
            }
          }
          // this.hotRegisterer.getInstance(this.id).loadData(this.data);
          // this.hotRegisterer.getInstance(this.id).loadData(this.dataForCalc);
          this.isPrognoz = true;
        } else {
          this.alert.show('Не удалось вычислить прогноз. Присутствуют некорректные данные');
        }
      } else {
        this.alert.show('Необходимо выбрать скважину и ЭО');
      }
    }
    // Установка на отображение прогнозных данных
    this.hotRegisterer.getInstance(this.id).loadData(this.dataForCalc);
    // Вызов расчета
    this.calculate(true);
  }

  loadFromCalcPlan($event: CalcObj): void {
    console.log('.... load from calc plan ....');
    this.calcObject = $event;
    try {
      this.utilService.copyAllEditableCells(this.calcObject.editableCells, this.dataForCalc);
      this.utilService.copyAllEditableCells(this.calcObject.editableCells, this.fData);
      this.utilService.copyAllEditableCells(this.calcObject.editableCells, this.data);
      // const newTeoBurData = this.calcObject.teoBur;
      // Установка значений для данных которые будут использоваться в расчете
      // // @ts-ignore
      // this.utilService.fillTeoData(this.dataForCalc, newTeoBurData);
      // // Установка значений в clearData для текущего отображения
      // // @ts-ignore
      // this.utilService.fillTeoData(this.data, newTeoBurData);
      // // Установка в объект с формулами
      // // @ts-ignore
      // this.utilService.fillTeoData(this.fData, newTeoBurData);
      // this.fData = this.calcObject.teoBur.fData;
      // this.dataForCalc = this.calcObject.teoBur.dataForCalc;
      this.hotRegisterer.getInstance(this.id).loadData(this.data);
    } catch (e) {
      console.log(e);
    }

    try {
      // Оборудование, кап вложения
      // @ts-ignore
      this.amortDeductEquipmentPage.fillTableData(this.calcObject.equipment, this.valuesService.isNew());
    } catch (error) {
      console.log('Ошибка расчета для ОБОРУДОВАНИЯ');
    }

    try {
      // Сохранения в объекте расчета
      // @ts-ignore
      this.amortDeductArrangementPage.fillTableData(this.calcObject.arrangement, this.valuesService.isNew());
    } catch (error) {
      console.log('Ошибка расчета для ОБУСТРОЙСТВА');
    }

    try {
      // Экономические показатели
      // @ts-ignore
      this.econIndicatorsPage.fillTableData(this.calcObject.econIndicators);
    } catch (error) {
      console.log('Ошибка расчета для ЭКОНОМИЧЕСКИХ НОРМАТИВОВ');
    }

    try {
      // Экономические нормативы
      // @ts-ignore
      this.econStandardPage.fillTableData(this.calcObject.econNormatives);
    } catch (error) {
      console.log('Ошибка расчета для ЭКОНОМИЧЕСКИХ ПОКАЗАТЕЛЕЙ');
    }

    try {
      // Переменные расходы
      // @ts-ignore
      this.expencesPage.fillTableData(this.calcObject.expenses);
    } catch (error) {
      console.log('Ошибка расчета для ПЕРЕМЕННЫХ РАСХОДОВ');
    }
    // this.calculate(false);
  }
}
