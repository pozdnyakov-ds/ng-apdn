import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TableModule} from 'primeng/table';

export enum Actions {
  get = 'get',
  del = 'del',
  upd = 'upd',
  add = 'add'
}

export interface DataSet {
  config_dataset?: string;
  id_dataset: number;
  name_dataset: string;
  operation_info?: any;
  info_dataset?: string;
  child?: boolean;
}

export interface DataSetTable {
  dataset_id: number;
  field_id: number;
  action: string;
  split_id?: any;
  well_id?: any;
  body: any;
}


export interface ColumnBase {
  field: string;
  title: string;
  hidden: boolean;
  editable: boolean;
}

@Component({
  selector: 'app-ng-uni-grid',
  templateUrl: './ng-uni-grid.component.html',
  styleUrls: ['./ng-uni-grid.component.styl']
})
export class NgUniGridComponent implements OnInit, OnDestroy {

  @Input() set tableData(value: Array<DataSet>) {
    this.modifiedItems = [];
    if (value) {
      console.log({length: value.length});
      // this.currentTableData = value;
      this.sourceData = [... value];
      this.originalData = JSON.parse(JSON.stringify(this.sourceData));
    } else {
      // this.currentTableData = [];
      this.sourceData = [];
      this.originalData = [];
    }
  }

  constructor() { }

  private readonly selectedRowsSearchResult = 'selected-rows-search-result';

  private newItemsId = -1;

  @ViewChild('table') table: TableModule;

  @Input() columns: Array<ColumnBase>;
  private originalData: Array<DataSet>;

  @Input() editable = true;
  /** Признак того что данные редактировались */
  @Input() isEdited: boolean;
  @Output() isEditedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public tableName: string;
  // public currentTableData: GridDataResult;
  public sourceData: Array<DataSet> = [];
  public clickedRowEvent;
  public clonedObject: { [s: string]: any; } = [];

  hideCommandColumn = true;

  private modifiedItems: Array<{action: string, item: any}> = [];

  selectedKeys: number[];

  indexes = [];

  public mySelection: number[] = [];
  selectedObject: any;
  public selectedCallback = (args) => args.dataItem;

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {

  }

  cellClick($event): void {
    this.clickedRowEvent = $event;
  }


  public addHandler(): void {
    // Insert a new row
    const obj = {
      ID: undefined
    };
    for (const col of this.columns) {
      // @ts-ignore
      if (col.visible !== 0) {
        // @ts-ignore
        obj[col.column] = '';
      }
    }
    obj.ID = this.newItemsId;
    this.newItemsId--;
    // @ts-ignore
    this.table.value.push(obj);
    // @ts-ignore
    this.table.initRowEdit(obj);
  }

  public cloneHandler(): void {
    console.log('clone handler');
    if (this.selectedObject) {
      const obj = {
        ID: undefined
      };
      for (const col of this.columns) {
        // @ts-ignore
        if (col.visible !== 0) {
          // @ts-ignore
          obj[col.column] = this.selectedObject[col.column];
        }
      }
      obj.ID = this.newItemsId;
      this.newItemsId--;
      // @ts-ignore
      this.table.value.push(obj);
      // @ts-ignore
      this.table.initRowEdit(obj);
    }
  }

  public cancelHandler({ sender, rowIndex }): void {
    sender.closeRow(rowIndex);
    this.hideCommandColumn = true;
  }

  public removeHandler(): void {
    console.log('removeHandler');
    if (!this.selectedObject) {
      alert('Для удаление необходимо выбрать элемент');
      return;
    }
    // this.editService.remove(dataItem);
    if (this.selectedObject.ID > -1) {
      this.isEditedEmit(true);
      this.modifiedItems.push({action: 'del', item: this.selectedObject});
      // this.currentTableData.splice(this.currentTableData.indexOf(dataItem),  1);
      this.sourceData.splice(this.sourceData.indexOf(this.selectedObject),  1);
    } else {
      this.modifiedItems.splice(this.modifiedItems.indexOf(this.modifiedItems.find(element => element === this.selectedObject)),  1);
      this.sourceData.splice(this.sourceData.indexOf(this.selectedObject),  1);
      if (this.modifiedItems.length === 0) {
        this.isEditedEmit(false);
      }
    }
    this.selectedObject = null;
  }

  public cancelChanges(): void {
    this.hideCommandColumn = true;
  }

  public createFormGroup(dataItem: any): any {
    const obj = {};
    for (const col of this.columns) {
      // @ts-ignore
      if (col.visible !== 0) {
        // @ts-ignore
        obj[col.column] = dataItem[col.column];
      }
    }
    return obj;
  }

  private checkModItems(element): void {
    if (element.ID > -1) { // Не новые элементы
      const el = this.modifiedItems.find(item => item.item.ID === element.ID);
      if (el) {
        this.modifiedItems.splice( this.modifiedItems.indexOf(el), 1);
      }
      this.modifiedItems.push({action: 'update', item: element});
    } else {
      const newObj = {action: 'add', item: element};
      this.modifiedItems.push(newObj);
    }
    if (this.modifiedItems.length > 0) {
      this.isEditedEmit(true);
    } else {
      this.isEditedEmit(false);
    }
  }

  public reset(): void {
    console.log('reset');
    this.isEditedEmit(false);
    this.modifiedItems = [];
    this.sourceData = this.originalData;
  }

  public getModified(): {'add': Array<DataSet>, 'del': Array<DataSet>, 'upd': Array<DataSet>} {
    const result: {'add': Array<DataSet>, 'del': Array<DataSet>, 'upd': Array<DataSet>} = {add: [], del: [], upd: []};
    this.modifiedItems.map(item => {
      switch (item.action) {
        case 'add': {
          result.add.push(item.item);
          break;
        }
        case 'update': {
          result.upd.push(item.item);
          break;
        }
        case 'del': {
          result.del.push(item.item);
          break;
        }
      }
    });
    return result;
  }

  /**
   * Поиск элемента в гриде
   * @param searchValue значение для поиска
   */
  search(searchValue: string): void {
    // this.indexes = [];
    // let i = -1;
    // const rows = this.grid.ariaRoot.nativeElement.getElementsByTagName('tr');
    // for (const row of Object.keys(this.grid.data)) {
    //   i++;
    //   for (const item in this.grid.data[row]) {
    //     if (this.grid.data[row][item]
    //       && this.grid.data[row][item].toString().indexOf(searchValue) > -1) {
    //       this.indexes.push(i + 1); // 0-ой элемент в гриде это шапка
    //     }
    //   }
    // }
    // if (this.indexes.length > 0) {
    //   // Прокрутка на первый найденный элемент, остальные просто подсвечиваем
    //   rows[this.indexes[0]].scrollIntoView();
    //   for (const ii of this.indexes) {
    //     if (rows[ii] && !rows[ii].classList.contains(this.selectedRowsSearchResult)) {
    //       rows[ii].classList.add(this.selectedRowsSearchResult);
    //       setTimeout(() => {
    //         rows[ii].classList.remove(this.selectedRowsSearchResult);
    //       }, 4000);
    //     }
    //   }
    // }
  }

  toExcel(fielname?: string): void {
    console.log('toExcel');
    this.tableName = fielname;
    // this.grid.saveAsExcel();
  }

  private isEditedEmit(value): void {
    this.isEdited = value;
    this.isEditedChange.emit(this.isEdited);
  }

  onRowEditInit(product: any): void {
    this.clonedObject[product.ID] = {...product};
  }

  onRowEditSave(product: any): void {
    console.log('on save');
    this.checkModItems(product);
    console.log({m: this.modifiedItems});
  }

  onRowEditCancel(obj: any, index: number): void {
    if (obj.ID> -1) {
      this.sourceData[index] = this.clonedObject[obj.ID];
      delete this.clonedObject[obj.ID];
    }
  }

  alert(number: number): void {
   // alert(1);
  }
}
