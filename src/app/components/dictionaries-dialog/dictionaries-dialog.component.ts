import {Component, OnInit, ViewChild} from '@angular/core';
import {AmortizationService, DictionaryItem} from '../../services/amortization.service';
import {ValuesService} from '../../services/values.service';
import {DictionaryEditorDialogComponent} from '../dictionary-editor-dialog/dictionary-editor-dialog.component';
import {ColumnBase, DataSet} from '../ng-uni-grid/ng-uni-grid.component';
import {Action, DictionariesService} from '../../services/dictionaries.service';
import {HandsonDictiEditorComponent} from '../handson-dicties/handson-dicti-editor/handson-dicti-editor.component';

@Component({
  selector: 'app-dictionaries-dialog',
  templateUrl: './dictionaries-dialog.component.html',
  styleUrls: ['./dictionaries-dialog.component.styl']
})
export class DictionariesDialogComponent implements OnInit {

  // @ViewChild('editorDialog') editorDialog: DictionaryEditorDialogComponent;
  @ViewChild('handsomEditorDialog') handsomEditorDialog: HandsonDictiEditorComponent;

  displayModal = false;
  dataSets: Array<any> = [];

  constructor(private valuesService: ValuesService,
              private dictiService: DictionariesService) { }

  ngOnInit(): void {
    this.getDictionaries();
  }

  /**
   * Получение списка справочников
   */
  async getDictionaries(): Promise<void> {
    console.log('get dictionaries');
    const tmp: any = await this.dictiService.getDataSets();
    if (tmp && tmp[0].JSON) {
      this.dataSets = JSON.parse(tmp[0].JSON);
    }
  }

  showHide( show?: boolean): void {
    if (show !== undefined && show !== null) {
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }
  }

  /**
   * Получить данные и сформированть справочник на основе dataSet
   * @param b набор конфигурации для справочных значений
   */
  showDictionary(b: DataSet): void {
    this.handsomEditorDialog.fillByDataSet(b);
  }
}
