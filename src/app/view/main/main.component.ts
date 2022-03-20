import {Component, OnInit, ViewChild} from '@angular/core';
import { PrognozService } from 'src/app/services/prognoz.service';
import { ValuesService } from 'src/app/services/values.service';
import {CommonDataService, Field, Mnk, OE} from '../../services/common-data.service';
import {TeoBurComponent} from './teo-bur/teo-bur.component';
import {MainDialogComponent, Page} from '../../components/main-dialog/main-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent {
  @ViewChild('teobur') teoBur: TeoBurComponent;
  @ViewChild('mainDialog') mainDialog: MainDialogComponent;

  // МНК
  selectedMnk: Mnk;
  // Месторождения
  fieldsDs: Array<Field>;
  firstTableData: Array<any>;

  selectedField: Field;
  // ЭО
  eoDs: Array<OE>;
  selectedEo: Array<OE>;

  public tabs = [{name: 'ТЭО Бурения', code: 0},
                 {name: 'ТЭО БС/БГС', code: 1},
                 {name: 'ОРЭ', code: 2}];
  public currentTab = this.tabs[0];
  page: Page;
  // Выбран фонд скважин
  skwsFundModel: {isEnabled: boolean; period: number} = {isEnabled: true, period: 4};

  constructor(private commonService: CommonDataService, private valuesService: ValuesService) { }

  /**
   * Получить список месторождений
   * @param $event событие
   */
  async getFields($event: any): Promise<void> {
    this.selectedMnk = $event;
    this.valuesService.setMnk(this.selectedMnk);
    this.fieldsDs = await this.commonService.getFields(this.selectedMnk.CODE_ORG);
    this.firstTableData = await this.commonService.getInitialCalcData(this.selectedMnk.CODE_ORG);
  }

  /**
   * Получить список эксплуатационных объектов
   * @param $event событие
   */
  async getOes($event: any): Promise<void> {
    this.valuesService.setField(this.selectedField);
    if (!this.valuesService.isNew()) {
      // const tmpOe = await this.commonService.getOes(this.selectedField.MEST_CODE);
      // tmpOe.sort((a, b) => (a.HOR_CODE > b.HOR_CODE) ? 1 : ((b.HOR_CODE > a.HOR_CODE) ? -1 : 0));
      // this.eoDs = tmpOe;
      this.eoDs = await this.commonService.getOes(this.selectedField.MEST_CODE);
      this.selectedEo = this.eoDs;
      this.emitForWells();
    } else {
      this.emitForWells();
    }
  }

  emitForWells(): void {
    this.teoBur.clearAreas();
    this.valuesService.setOE(this.selectedEo);
    this.teoBur.emitForWells(true);
  }

  pageSelected($event: Page): void {
    this.resetSelection();
    this.page = $event;
    this.mainDialog.showHide(false);
    this.valuesService.setIsNew($event.isNewWell);
    this.valuesService.setActualPeriod(this.skwsFundModel.period);
  }

  /**
   * Обработчик установки периода
   */
  setPeriod(): void {
    this.valuesService.setActualPeriod(this.skwsFundModel.period);
    this.teoBur.emitForWells(true);
  }

  /**
   * Сброс выбора
   */
  resetSelection(): void {
    this.valuesService.setField(undefined);
    this.selectedField = undefined;
    this.teoBur.emitForWells(false);
    this.selectedEo = [];
    this.teoBur.clearAreas();
  }
}
