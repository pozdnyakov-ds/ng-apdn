import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DictionaryItem} from '../../services/amortization.service';
import {DataSet, NgUniGridComponent} from '../ng-uni-grid/ng-uni-grid.component';
import {Action, DictionariesService} from '../../services/dictionaries.service';
import {ValuesService} from '../../services/values.service';
import {AlertComponent, YesNo} from '../alert/alert.component';

@Component({
  selector: 'app-dictionary-editor-dialog',
  templateUrl: './dictionary-editor-dialog.component.html',
  styleUrls: ['./dictionary-editor-dialog.component.styl']
})
export class DictionaryEditorDialogComponent implements OnInit {

  @ViewChild('unigrid') uniDataGrid: NgUniGridComponent;
  @ViewChild('alert') alert: AlertComponent;
  private message: any;

  @Input() set dictionaryData(value: Array<DictionaryItem>) {
    this.sourceData = value;
  }

  @Input() dictionary: any = {name: ''};

  private sourceData: any;
  private lastAction: DataSet;
  public isEdited = false;

  displayModal = false;
  columns: any;
  tableData: any;

  public editModel: {
    button_edit: boolean;
    button_add: boolean, button_upd: boolean, button_del: boolean, button_duplication: boolean
  } =
    {button_edit: false, button_add: false, button_upd: false, button_del: false, button_duplication: false};

  constructor(private valuesService: ValuesService,
              private dictiService: DictionariesService) { }

  ngOnInit(): void {
    console.log({data: this.dictionaryData});
  }

  public showHide( show?: boolean): void {
    if (show !== undefined && show !== null) {
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }
  }

  async fillByDataSet(b: DataSet): Promise<void> {
    this.isEdited = false;
    this.columns = JSON.parse(b.info_dataset);
    if (b.config_dataset) {
      this.editModel = JSON.parse(b.config_dataset);
    }
    this.showHide(true);
    this.lastAction = b;

    const params: Action = {
      action: 'get',
      dataset_id: b.id_dataset,
      org_id: this.valuesService.getMnk().CODE_ORG
    };
    const obj = await this.dictiService.action(params);
    // this.tableData = obj.DATA;
    this.tableData = obj.DATA.map(item => ({
      ...item,
      ID: Number(item.ID)
    }));
    this.message = obj.RES;
  }

  async apply(): Promise<void> {
    console.log('apply');
    const mod = this.uniDataGrid.getModified();
    let counter = 0;
    let messages = '';
    let errors = '';
    for (const key of Object.keys(mod)) {
      if (mod[key].length > 0) {
        counter++;
        await this.dictiService.action({
          org_id: this.valuesService.getMnk().CODE_ORG,
          action: key,
          dataset_id: this.lastAction.id_dataset,
          body: mod[key]
        }).then(value => {
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
            this.fillByDataSet(this.lastAction);
            this.showMessage(messages, errors);
          }
        }).catch(error => {
          counter--;
          if (counter === 0) { // Обновление таблицы
            this.fillByDataSet(this.lastAction);
            this.showMessage('Не удалось обработать запрос, возможно сервер недоступен');
          }
          console.log('log:info',
            `Операция с таблицей - неудачно. Ответ сервера:  ${(error && error.error && error.error.error) ? JSON.stringify(error.error.error) : JSON.stringify(error)}`
          );
        });
      }
    }
  }

  showMessage(text: string, detail?: string, title?: string): void {
     if (detail && detail.length > 0) {
        this.alert.show(text, detail);
     } else {
        this.alert.show(text);
     }
  }

  close(): void {
    if (this.uniDataGrid &&
      (this.uniDataGrid.getModified().add.length > 0 ||
        this.uniDataGrid.getModified().del.length > 0 ||
        this.uniDataGrid.getModified().upd.length > 0)) {
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
}
