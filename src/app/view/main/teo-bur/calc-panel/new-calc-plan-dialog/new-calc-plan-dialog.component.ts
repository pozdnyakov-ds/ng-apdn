import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AlertComponent} from '../../../../../components/alert/alert.component';
import {CalcObj, CalcsList, UserStorageService} from '../../../../../services/user-storage.service';
import {CalculationsListDialogComponent} from '../../calculations-list-dialog/calculations-list-dialog.component';
import {ValuesService} from "../../../../../services/values.service";
import { CalcparamService } from 'src/app/services/calcparam.service';


@Component({
  selector: 'app-new-calc-plan-dialog',
  templateUrl: './new-calc-plan-dialog.component.html',
  styleUrls: ['./new-calc-plan-dialog.component.styl']
})
export class NewCalcPlanDialogComponent {
  @ViewChild('alert') alertComp: AlertComponent;

  @ViewChild('calculationsListDialogComponent') calculationsListDialogComponent: CalculationsListDialogComponent;

  /* Объект с вариантами расчета */
  @Input() calcObject: CalcObj;

  @Output() saved: EventEmitter<void> = new EventEmitter<void>();

  /* Скрыть / показать дилаоговоый элемент */
  displayModal: boolean;
  /* Номер расчета */
  calcNumber: any;
  /* Описание расчета */
  calcDescription: any;
  /* Объект со списокм вариантов расчета */
  objectsList: Array<CalcsList>;


  constructor(private userStorage: UserStorageService, private valuesService: ValuesService, private calcparamService: CalcparamService) { }

  /**
   * Получение списка расчетов
   */
  async init(): Promise<void> {
    console.log('new calcs save');
    this.objectsList = await this.userStorage.getListObject(this.valuesService.getWell());
    this.calcNumber = this.objectsList.length + 1;
    console.log({objects: this.objectsList});
  }

  /**
   * Обработчик кнопки сохранить
   */
  async saveCalculation(): Promise<void> {
    if (this.calcDescription && this.calcDescription.trim().length > 0) {
      const newCalc: CalcsList = {
        id: this.calcNumber,
        key: 'calcObject' + this.calcNumber,
        calcObjects: this.calcObject,
        comment: this.calcDescription,
      };
      this.objectsList.push(newCalc);
      // Сохраняем объект расчета и варианты расчета
      this.userStorage.saveCalcObj(this.calcObject, newCalc.id, this.valuesService.getWell());
      this.userStorage.saveListObject(this.objectsList, this.valuesService.getWell());

      //MegaDoIt >>
      await this.calcparamService.getList()
      .then(value => {
        console.log('!!!!!!!!!!!!!');
       }).catch(error => {
        console.log(`Операция сохранения неудачна:  ${(error && error.error && error.error.error)}`
        );
      });


      await this.calcparamService.addParam(true, 21, 'Что то', 'Тест')
      .then(value => {
        console.log('!!!!!!!!!!!!!');
       }).catch(error => {
        console.log(`Операция добавления неудачна:  ${(error && error.error && error.error.error)}`
        );
      });


      //MegaDoIt <<

      this.displayModal = false;
      this.alertComp.show('Расчет сохранен!');
      this.saved.emit();
    } else {
      this.alertComp.show('Необходимо вввести описание расчета');
    }
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
}
