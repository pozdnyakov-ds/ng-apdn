import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommonDataService, Mnk} from '../../services/common-data.service';
import {DictionariesDialogComponent} from '../dictionaries-dialog/dictionaries-dialog.component';
import {EconomicsDialogComponent} from '../economics-dialog/economics-dialog.component';
import * as Excel from 'exceljs';
import { AlertComponent, YesNo } from '../alert/alert.component';
import { ParusLoaderService } from 'src/app/services/parus-loader.service';

export interface Page {
  title: string;
  code: number;
  isNewWell?: boolean;
  // isDisabled: boolean;
}

interface WellValue {
  isNew: boolean;
  label: string;
  groups: string;
}

@Component({
  selector: 'app-main-dialog',
  templateUrl: './main-dialog.component.html',
  styleUrls: ['./main-dialog.component.styl']
})
export class MainDialogComponent implements OnInit {

  @ViewChild('dictisDialog') dictisDialog: DictionariesDialogComponent;
  @ViewChild('econDialog') economicsDialogComponent: EconomicsDialogComponent;
  @ViewChild('alertFileInput') alert: AlertComponent;
  @ViewChild('fileInput') fileInput: ElementRef;

  @Output() mnkSelected: EventEmitter<Mnk> = new EventEmitter();
  @Output() pageSelected: EventEmitter<Page> = new EventEmitter();

  displayModal = true;

  mnkDs: Array<Mnk>;
  selectedMnk: Mnk;

  buttons: Array<Page> =
    [
      {title: 'Бурение и ввод новых скважин', code: 1},
      {title: 'Бурение ("зарезка") БС/БГС', code: 2},
      {title: 'Внедрение оборудования ОРЭ', code: 3},
      {title: 'Проведение КРС', code: 4},
      {title: 'Проведение МУН', code: 5},
      {title: 'Развитие системы ППД', code: 6}
    ];

  radioButtons: Array<WellValue> = [
      {label: 'Технико экономиечское обоснование ГТМ (для новых скважин)', isNew: true, groups: 'skwWells'},
      {label: 'Расчет показателей проведенных ГТМ (для пробуренных скважин)', isNew: false, groups: 'skwWells'}
  ];

  selectedGtm: Page = this.buttons[0];
  selectedWellValue: WellValue;

  public showHide( show?: boolean): void {
    if (show !== undefined && show !== null) {
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }
  }

  constructor(private commonService: CommonDataService,
              private parusLoaderService: ParusLoaderService) { }

  async ngOnInit(): Promise<void> {
    this.mnkDs = await this.commonService.getMnks();
    this.selectedWellValue  = this.radioButtons[0];
  }

  /**
   * Кастер события выбора МНК
   * @param $event
   */
  emitMnk($event: any): void {
    this.mnkSelected.emit(this.selectedMnk);
  }

  /**
   * Обработчик кнопки "Шаблоны данных" (справочники)
   * @param $event объект события
   */
  showDictionaries($event: any): void {
    this.dictisDialog.showHide(true);
  }

  /**
   * Кастер собтыия выбора страницы
   */
  pageEmit(): void {
    this.selectedGtm.isNewWell = this.selectedWellValue.isNew;
    this.pageSelected.emit(this.selectedGtm);
  }

  /*
  * Загрузка файла из Паруса
  */
  onFileInput(event): void {
    const workbook = new Excel.Workbook();
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    if (!target.files[0].name.endsWith('.xlsx'))
      this.alert.show('Файл должен быть в формат Excel (.xlsx).');


    const arryBuffer = new Response(target.files[0]).arrayBuffer();

    arryBuffer.then((data) => { // MQuestion: arryBuffer.then(function (data) {
      workbook.xlsx.load(data)
        .then(()=> {
          const worksheet = workbook.getWorksheet(1);
          console.log('Parus file rowCount: ', worksheet.rowCount);
          let columnNames = worksheet.getRow(1).values.toString();

          switch (columnNames) {
            // Для амортизации
            case ",Скважина,Тип ввода,Мнемокод,Принадлежность,Тип объекта (0-скважина,1-обустройство,2-оборудование),Тип объекта,Наименование,Инвентарный,Дата ввода,Сумма,Мнемокод вида ГТМ,Состояние,СПИ (мес),Составное наименование":
              this.alert.showConfirm("Загрузка данных из Паруса", "Будут загружены данные 'Для амортизации', <br>Выполнить загрузку?", (value) => {
               if (value === YesNo.yes) {

                  let amortArray = [];
                  if (worksheet.rowCount > 1) {
                    worksheet.eachRow((row, rowNumber) => {
                      if (rowNumber != 1) {
                          const parusData = {
                            num_well: row.values[1],
                            name_org: row.values[4],
                            type_obj: row.values[5],
                            name_obor: row.values[7],
                            date_in: row.values[9],
                            cost_obor: row.values[10],
                            state: row.values[12],
                            spi: row.values[13]
                          }
                          amortArray.push(parusData);
                      }

                        console.log('Row: ' + rowNumber + ' Value: ' + row.values);
                    });
                    this.UploadAmort(amortArray);
                  }
                }
              });

              break;
            // Раздел исходные данные, спецификация
            case ",Принадлежность,Год,Тип,Мнемокод,Наименование,Тонн,Руб,Руб/т":
              alert( "+1" );
              break;
            // Скважины на ГТМ
            case "+2":
              alert( ",Мнемокод,Принадлежность,Мнемокод вида ГТМ,Местонахождение,Скважина,Год проведения ГТМ,Дата ГТМ с,Дата ГТМ по,Наименование местонахождения,Состояние" );
              break;
            default:
              this.alert.show('Структура документа не распознана');
          }
        });
    });

    this.fileInput.nativeElement.value = "";
  }


  async UploadAmort(val: any): Promise<void> {
    console.log(val);
    let counter = 0;
    let messages = '';
    let errors = '';
    if (val.length > 0) {
      counter++;
      await this.parusLoaderService.LoadAmort(val)
      .then(value => {
        alert('+++25');
        /*
        counter--;
        // @ts-ignore
        if (value && value.status) {
          // @ts-ignore
          messages += '\n' + value.status;
        }
        // @ts-ignore
        if (value && value.error) {
          // @ts-ignore
          errors += '\n' + value.error;
        }
        console.log('log:info',
          `Изменения успешно сохранены.`
        );
        if (counter === 0) { // Обновление таблицы
          this.fillByDataSet();
        }*/
      }).catch(error => {

        alert('---25');

        /*counter--;
        if (counter === 0) { // Обновление таблицы
          this.fillByDataSet();
        }
        console.log('log:info',
          `Операция с таблицей - неудачно. Ответ сервера:  ${(error && error.error && error.error.error) ? JSON.stringify(error.error.error) : JSON.stringify(error)}`
        );*/
      });
    }
  }


}
