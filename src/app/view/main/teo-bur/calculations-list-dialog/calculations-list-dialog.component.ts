import { Component, OnInit } from '@angular/core';
import {CalcObj, CalcsList, UserStorageService} from '../../../../services/user-storage.service';
import {ValuesService} from "../../../../services/values.service";

@Component({
  selector: 'app-calculations-list-dialog',
  templateUrl: './calculations-list-dialog.component.html',
  styleUrls: ['./calculations-list-dialog.component.styl']
})
export class CalculationsListDialogComponent implements OnInit {
  /* Скрыть/показать  диалоговый элемент */
  displayModal: boolean;
  calcsList: Array<CalcsList>;

  constructor(private userStorage: UserStorageService, private valuesService: ValuesService) { }

  ngOnInit(): void {
    this.init();
  }

  /**
   * Метод init - получаем список расчетов
   */
  async init(): Promise<void> {
    console.log("init");
    this.calcsList = await this.userStorage.getListObject(this.valuesService.getWell());
  }

  /**
   * Скрыть / показать диалоговое окно
   * @param show признак скрыть/показать
   */
  public showHide( show?: boolean): void {
    if (show !== undefined && show !== null) {
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }

    if (this.displayModal) {
      this.init();
    }
  }

  /**
   * Метод удаления расчетного плана
   * @param calc
   */
  removeItem(calc: CalcsList): void {
    const index = this.calcsList.findIndex(item => item.id === calc.id);
    if (index > -1) {
      this.calcsList.splice(index, 1);
    }
    this.userStorage.saveListObject(this.calcsList, this.valuesService.getWell());
  }
}
