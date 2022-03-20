import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AlertComponent, YesNo} from '../alert/alert.component';
import {HotTableRegisterer} from '@handsontable/angular';
import {clearData as staticData} from './settings/clear-data';
import * as Handsontable from 'handsontable';
import {hotSettings} from './settings/econ-hot-settings';
import {FormulaParserService} from '../../services/formula-parser.service';
import {DictionariesService} from 'src/app/services/dictionaries.service';
import {toXML} from 'jstoxml';

@Component({
  selector: 'app-economics-dialog',
  templateUrl: './economics-dialog.component.html',
  styleUrls: ['./economics-dialog.component.styl']
})
export class EconomicsDialogComponent implements OnInit {
  @ViewChild('alert') alert: AlertComponent;
  displayModal: any;
  isEdited: false;

  clearData: any[][];
  columns: any[];
  params = [
    {key: 'NORM_DISCONT', ed_izm: '%', text: 'Норма дисконтирования'},
    {key: 'TAX_PROP', ed_izm: '%', text: 'Налог на имущество'},
    {key: 'TAX_PROFIT', ed_izm: '%', text: 'Налог на прибыль'}
  ];

  @Input('hotData') set hotData(value: Array<Array<any>>) {
    this.data = value;
  }

  private hotRegisterer = new HotTableRegisterer();
  id = 'econHotInstance';

  data = JSON.parse(JSON.stringify(staticData));
  // @ts-ignore
  hotSettings: Handsontable.GridSettings = {
    data: this.data,
    ...hotSettings
  };

  constructor(private fParser: FormulaParserService,
              private dictiService: DictionariesService) {
  }

  ngOnInit(): void {
  }


  public showHide(show?: boolean): void {
    if (show !== undefined && show !== null) {
      this.fillByDataSet();
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }
  }

  close(): void {
    console.log('close');
    if (!this.fParser.arrays2DCompare(this.data, this.clearData)) {
      this.alert.showConfirm('Внимание', 'Присутствуют несохраненные изменения, продолжить?', (value) => {
        console.log('confirmDialog');
        if (value === YesNo.yes) {
          this.displayModal = false;
        }
      });
    } else {
      this.displayModal = false;
    }
  }

  async fillByDataSet(): Promise<void> {
    this.columns = ['Параметры', 'ед.изм.'];
    const obj = await this.dictiService.getNormative();
    console.log(obj);
    this.clearData = [];
    this.clearData.push([]);
    this.columns.forEach((item) => {
      this.clearData[0].push(`${item}`);
    });
    obj.forEach((item, index) => {
      this.columns.push(item.YEAR);
      this.clearData[0].push(`${item.YEAR}`);
    });
    this.params.forEach((item, index) => {
      this.clearData.push([]);
      this.clearData[index + 1].push(`${item.text}`);
      this.clearData[index + 1].push(`${item.ed_izm}`);
      obj.forEach((yr) => {
        this.clearData[index + 1].push((yr[item.key]) ? `${yr[item.key]}` : ``);
      });
    });
    this.data = JSON.parse(JSON.stringify(this.clearData));
    // Присвавиаем объект
    this.updateHandsonData(this.data);
  }

  updateHandsonData(data): void {
    this.hotRegisterer.getInstance(this.id).loadData(data);
  }

  save(): void {
    this.alert.showConfirm('Внимание', 'Сохранить изменения?', (value) => {
      if (value === YesNo.yes) {
        const changes = this.getChanges();
        this.apply(this.Array2DToObject(changes.update)); // setNormative
        this.showHide(false);
      }
    });
  }

  /**
   * Получить список новых записей
   * @private
   */
  getChanges(): { update: any[] } {
    const res: { 'update': any[] } = {update: []};
    this.data.forEach((item, index) => {
      if (index !== 0 && index !== this.data.length - 1) { // Экранируем последнюю первую и последнуюю строку
        // Поиск модифицированных
        // Поиск по идентификатору
        const clearItem = this.clearData.find(cItem => item[0] === cItem[0]);
        if (clearItem && clearItem.length > 0 && JSON.stringify(item) !== JSON.stringify(clearItem)) { // Модифицированные
          res.update.push(item);
        }
      }
    });
    return res;
  }

  Array2DToObject(arr: any): string {
    const ret = {RECS: []};
    this.columns.forEach((item, index) => {
      const rec = {};
      if (index > 1) {
        rec['YEAR'] = item;
        arr.forEach(prm => {
          const foundedPrm = this.params.find(x => x.text == prm[0]);
          if (foundedPrm) {
            rec[`${foundedPrm.key}`] = prm[index];
          }
        });
        ret.RECS.push({REC: rec});
      }
    });
    console.log(ret);
    return `${toXML(ret)}`;
  }
  // ret = {
    //   RECS: [
    //     {
    //       REC: {
    //         YEAR: '2019',
    //         NORM_DISCONT: 20,
    //         TAX_PROP: 11
    //       }
    //     },
    //     {
    //       REC: {
    //         YEAR: '2018',
    //         NORM_DISCONT: 21,
    //         TAX_PROP: 12
    //       }
    //     }
    //   ]
    // };

  async apply(mod: any): Promise<void> {
    console.log(mod);
    let counter = 0;
    let messages = '';
    let errors = '';
    if (mod.length > 0) {
      counter++;
      await this.dictiService.setNormative(mod //setNormative_MTest // MegaTest (тестирование работы через сервис)
      ).then(value => {
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
        }
      }).catch(error => {
        counter--;
        if (counter === 0) { // Обновление таблицы
          this.fillByDataSet();
        }
        console.log('log:info',
          `Операция с таблицей - неудачно. Ответ сервера:  ${(error && error.error && error.error.error) ? JSON.stringify(error.error.error) : JSON.stringify(error)}`
        );
      });
    }
  }
}
