import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertComponent, YesNo} from '../../alert/alert.component';
import {HotTableRegisterer} from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import {FormulaParserService} from '../../../services/formula-parser.service';
import {DataSet} from '../../ng-uni-grid/ng-uni-grid.component';
import {Action, DictionariesService} from '../../../services/dictionaries.service';
import {ValuesService} from '../../../services/values.service';
import {hotSettings} from './settings/handson-hot-settings';

@Component({
  selector: 'app-handson-dicti-editor',
  templateUrl: './handson-dicti-editor.component.html',
  styleUrls: ['./handson-dicti-editor.component.styl']
})
export class HandsonDictiEditorComponent implements OnInit {
  @ViewChild('alert') alert: AlertComponent;

  // @Input() set dictiData( value: any[][]) {
  //   this.clearData = JSON.parse(JSON.stringify(value));
  //   this.data = JSON.parse(JSON.stringify(value));
  // }

  clearData: any[][];
  displayModal: any;
  columns: any[];
  //
  // @Input('hotData') set hotData(value: Array<Array<any>>) {
  //   this.data = value;
  // }
  private hotRegisterer = new HotTableRegisterer();
  id = 'econHotInstance';

  data: any[][] = [];
  // @ts-ignore
  hotSettings: Handsontable.GridSettings = {
    data: this.data,
    ...hotSettings
  };
  private lastAction: DataSet;

  constructor(private fParser: FormulaParserService,
              private valuesService: ValuesService,
              private dictiService: DictionariesService) {
  }

  ngOnInit(): void {
  }


  public showHide(show?: boolean): void {
    if (show !== undefined && show !== null) {
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

  async fillByDataSet(b: DataSet): Promise<void> {
    console.log('************** set last action');
    this.lastAction = b;

    this.clearData = [];
    this.columns = JSON.parse(b.info_dataset);

    this.showHide(true);
    const params: Action = {
      action: 'get',
      dataset_id: b.id_dataset,
      org_id: this.valuesService.getMnk().CODE_ORG
    };
    const obj = await this.dictiService.action(params);

    obj.DATA.forEach((item, index) => {
      if (index === 0) { // Добавляем доп массив для заголвоков
        this.clearData.push([]);
      }
      this.clearData.push([]);
      this.columns.forEach(column => {
        if (index === 0) { // Заголовки
          this.clearData[index].push(`${column.title} (${column.column})`);
        }
        // Тело
        this.clearData[index + 1].push(`${item[column.column]}`);
      });
    });
    // Пустая строчка снизу
    this.clearData.push([]);
    this.data = JSON.parse(JSON.stringify(this.clearData));
    // Присвавиаем объект
    this.updateHandsonData(this.data);
  }

  updateHandsonData(data): void {
    this.hotRegisterer.getInstance(this.id).loadData(data);
  }

  save(): void {

    this.alert.showConfirm('Внимание', 'Сохранить изменения??', (value) => {
      if (value === YesNo.yes) {
        const changes = this.getChanges();
        this.apply(changes);
      }
    });
  }

  Array2DToObject(arr: any[], type = 'custom'): object {
    const ret = {};
    this.columns.forEach((item, index) => {
      if (type !== 'add') {
        ret[item.column] = arr[index];
      } else {
        if (item.column.toLowerCase() !== 'id') {
          ret[item.column] = arr[index];
        }
      }
    });
    return ret;
  }

  /**
   * Получить список новых записей
   * @private
   */
  getChanges(): { add: any[]; del: any[]; update: any[] } {
    const res: { 'add': any[], 'del': any[], 'update': any[] } = {add: [], del: [], update: []};
    // Поиск записей с пустым идентификаторов
    this.data.forEach((item, index) => {
      if (index !== 0 && index !== this.data.length - 1) { // Экранируем последнюю первую и последнуюю строку
        if (item[0] == null) {  // Новые
          res.add.push(this.Array2DToObject(item, 'add'));
        }
        // Поиск модифицированных
        // Поиск по идентификатору
        const clearItem = this.clearData.find(cItem => item[0] === cItem[0]);
        if (clearItem && clearItem.length > 0 && JSON.stringify(item) !== JSON.stringify(clearItem)) { // Модифицированные
          res.update.push(this.Array2DToObject(item));
        }
      }
    });
    this.clearData.forEach(cItem => {
      // Поиск удаленных
      if (!this.data.find(dItem => cItem[0] === dItem[0])) {
        res.del.push(this.Array2DToObject(cItem));
      }
    });
    return res;
  }

  reset(): void {
    this.data = JSON.parse(JSON.stringify(this.clearData));
    this.updateHandsonData(this.data);
  }

  async apply(mod: any): Promise<void> {
    let counter = 0;
    let messages = '';
    let errors = '';
    for (const key of Object.keys(mod)) {
      if (mod[key].length > 0) {
        counter++;
        this.dictiService.action({
          org_id: this.valuesService.getMnk().CODE_ORG,
          action: key,
          dataset_id: this.lastAction.id_dataset,
          body: mod[key]
        }).then(value => {
          counter--;
          // @ts-ignore
          if (value && value.status) {
            // @ts-ignore
            messages += '<br>' + value.status + ` (Действие: ${key})`;
          }
          // @ts-ignore
          if (value && value.error) {
            // @ts-ignore
            errors += '<br>' + value.error + ` (Действие: ${key})`;
          }
          console.log('log:info',
            `Изменения успешно сохранены.`
          );
          if (counter === 0) { // Обновление таблицы
            console.log('couniter is 0');
            this.showMessage(messages, errors);
            this.fillByDataSet(this.lastAction);
          }
        }).catch(error => {
          counter--;
          if (counter === 0) { // Обновление таблицы
            this.showMessage('Не удалось обработать запрос, возможно сервер недоступен');
            // this.fillByDataSet(this.lastAction);
          }
          console.log('log:info',
            `Операция с таблицей - неудачно. Ответ сервера:  ${(error && error.error && error.error.error) ? JSON.stringify(error.error.error) : JSON.stringify(error)}`
          );
        });
      }
    }
  }

  /**
   * Показать сообщение
   * @param text    отображаемый текст
   * @param detail  детальное описание
   * @param title   заголовок
   */
  showMessage(text: string, detail?: string, title?: string, callBack?: () => {}): void {
    if (detail && detail.length > 0) {
      this.alert.show(text, detail);
    } else {
      this.alert.show(text);
    }
  }
}
