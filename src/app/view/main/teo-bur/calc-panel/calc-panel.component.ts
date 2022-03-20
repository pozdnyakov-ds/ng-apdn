import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CalcPlan, CalcPlansService} from '../../../../services/calc-plans.service';
import {AlertComponent} from '../../../../components/alert/alert.component';
import {ValuesService} from '../../../../services/values.service';
import {NewCalcPlanDialogComponent} from './new-calc-plan-dialog/new-calc-plan-dialog.component';
import {CalcObj, CalcsList, UserStorageService} from '../../../../services/user-storage.service';
import {CalculationsListDialogComponent} from '../calculations-list-dialog/calculations-list-dialog.component';
import {Well} from '../../../../services/common-data.service';

@Component({
  selector: 'app-calc-panel',
  templateUrl: './calc-panel.component.html',
  styleUrls: ['./calc-panel.component.styl']
})
export class CalcPanelComponent {

  @ViewChild('alert') alert: AlertComponent;
  @ViewChild('newCalcPlanDialog') newCalcPlanDialog: NewCalcPlanDialogComponent;
  @ViewChild('calcList') calcList: CalculationsListDialogComponent;

  @Output() caluclateEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadFromCalulation: EventEmitter<any> = new EventEmitter<any>();
  @Output() fromCalcPlan: EventEmitter<CalcObj> = new EventEmitter<CalcObj>();

  @Input() calcObject: CalcObj;
  // @Input() selectedWell: Well;


  calcPlans: Array<CalcsList>;
  selectedCalcPlan: CalcsList;

  constructor(private calcPlansService: CalcPlansService,
              public valuesService: ValuesService,
              private userStorage: UserStorageService) { }


  init(): void {
    console.log('get calc plans');
    // this.calcPlans = await this.calcPlansService.getListCalcResult(this.valuesService.getMnk().CODE_ORG,
    //   this.valuesService.getWell().WELL_ID);
    // this.calcPlans = await this.userStorage.getListObject(this.selectedWell);
    this.userStorage.getListObject(this.valuesService.getWell()).then(value => {
      this.calcPlans = value;
    });
  }

  /**
   * Удаление варианта расчета
   */
  async removeCalcPlan(): Promise<void> {
    console.log('removeCalcPlan');
    if (this.selectedCalcPlan) {
      // let list = await this.userStorage.getListObject();
      const list = await this.userStorage.getListObject(this.valuesService.getWell());
      const index = list.findIndex(value => {
        return value.id === this.selectedCalcPlan.id;
      });
      if (index !== undefined) {
        list.splice(index, 1);
        this.userStorage.saveListObject(list, this.valuesService.getWell());
      }
    } else {
      this.alert.show('Вариант расчета не выбран');
    }
    this.selectedCalcPlan = undefined;
    this.init();
  }
  save(): void {
    // Если уже выбран вариант расчета то пересохраняем его, иначе вызываем окно "сохранить как"
    if (this.selectedCalcPlan === undefined) {
      this.newCalcPlanDialog.showHide(true);
    } else {
      // Сохраняем текущий расчетный план
      // @ts-ignore
      this.calcObject.equipment = this.calcObject.equipment.splice(this.calcObject.equipment.length - 3, 2);
      // @ts-ignore
      this.calcObject.expenses = this.calcObject.expenses.splice( this.calcObject.expenses.length - 3, 2);
      // @ts-ignore
      this.calcObject.arrangement = this.calcObject.arrangement.splice(this.calcObject.arrangement.length - 3, 2);
      this.userStorage.saveCalcObj(this.calcObject, this.selectedCalcPlan.id, this.valuesService.getWell());
      this.alert.show('Расчет сохранен!');
    }
    this.init();
  }

  /**
   * Обработчик кнопки "Сохранить как"
   */
  saveAs(): void {
      this.newCalcPlanDialog.showHide(true);
  }

  /**
   * Показать список расчетных планов
   */
  showCalcPlans(): void {
    this.calcList.showHide(true);
  }

  /**
   * Выбор варианта расчета
   * @param $event выбранный план расчета
   */
  calcPlanSelected($event: CalcsList): void {
    console.log('calc plan selected');
    // @ts-ignore
    this.userStorage.getCalcObject($event.value.id, this.valuesService.getWell()).then(value => {
      this.fromCalcPlan.emit(value);
    });
  }
}
