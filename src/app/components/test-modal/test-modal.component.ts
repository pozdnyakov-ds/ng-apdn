import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { DictionariesService } from 'src/app/services/dictionaries.service';
import { hotSettings } from './settings/econ-hot-settings';
import {clearData as staticData} from './settings/clear-data';
import { PrognozServiceNewWell } from 'src/app/services/prognozNewWell.service';
import { MyTest, TestModalServicesService } from 'src/app/services/test-modal.services.service';
import { AlertComponent } from '../alert/alert.component';
import { ValuesService } from 'src/app/services/values.service';


@Component({
  selector: 'app-test-modal',
  templateUrl: './test-modal.component.html',
  styleUrls: ['./test-modal.component.styl']
})
export class TestModalComponent implements OnInit {

  public displayModal: boolean = false;

  columns: any[] = ['Месяц.Год', 'Добыча нефти, т', 'Добыча жидкости, т', 'Обв-сть, %', 'Дебит нефти, т/сут', 'Дебит жидкости, т/сут', 'Нак. добыча нефти, т', 'Доп. добыча нефти за счет ГТМ, т', 'Накопл. доп. добыча нефти за счет ГТМ, т'];


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


  constructor(private dictiService: DictionariesService,
              private prognozServiceNewWell: PrognozServiceNewWell, // Удалить
              private testModalService: TestModalServicesService,
              private valuesService: ValuesService) { }


  ngOnInit(): void {
  }


  @ViewChild('alert') alert: AlertComponent;


  public onShow(): void {
    this.displayModal = true;

    this.prepareWindow(); //.then(q=> this.displayModal = true);
  }

  public onHide(): void {
    this.displayModal = false;
  }


  onResize(event?) {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }


  private _caption: string;
  public get caption(): string {
    return this._caption;
  }

  public set caption(well: string) {
    this._caption = "Скважина: ";
    if(well !== null){
      this._caption += well;
    }
  }

/**
  Получение данных
**/
 async prepareWindow(): Promise<boolean> {
  console.log('testModal v2');

  const well = this.valuesService.getWell();
  const mest = this.valuesService.getField();

  let oes = '';
  const oe = this.valuesService.getOE();
  if (oe) {
    oes = oe.map(e => e.HOR_CODE).join(',');
  }
  //>> MegaTest
  const org_code = this.valuesService.getMnk();
  const mest_code = this.valuesService.getField();





  //<< MegaTest
  if (well && oes) {
    const prognozValue = await this.testModalService.run(well.WELL_ID, oes, null, null,
      org_code.CODE_ORG,
      mest_code.MEST_CODE,
      oes,
      well.WELL_ID);
    if (prognozValue != null) {
      // prognozValue(q=> this.fillByDataSet(q));
      this.fillByDataSet(prognozValue);
      return true;
    } else {
      this.displayModal = false;
      this.alert.show('Не удалось получить данные');
    }
  } else {
    this.displayModal = false;
    this.alert.show('Необходимо выбрать скважину и ЭО');
  }
  return false;
}




async fillByDataSet(myData: MyTest[]): Promise<void> {
  let data: any[][] = [];
  //console.log(obj);

  data.push(this.columns);
  /*
  obj.forEach((item, index) => {
    this.columns.push(item.YEAR);
    this.clearData[0].push(`${item.YEAR}`);
  });
  */
  myData.forEach((item: MyTest, index) => {
    data.push([]);

    data[index + 1][0] = item.dt;
    data[index + 1][1] = item.prodoil;
    data[index + 1][2] = item.prodliq;
    data[index + 1][3] = item.ffact;
    data[index + 1][4] = item.qoil;
    data[index + 1][5] = item.qliq;
    data[index + 1][6] = item.qoilcum;
    data[index + 1][7] = item.noil;
    data[index + 1][8] = item.ngidk;
    data[index + 1][9] = item.oil;
  });


  this.data = JSON.parse(JSON.stringify(data));
  // Присвавиаем объект
  this.updateHandsonData(this.data);
}

updateHandsonData(data): void {
  this.hotRegisterer.getInstance(this.id).loadData(data);

  setTimeout(function() {
    this.hotRegisterer.getInstance(this.id).render();
 }, 1000);

}


}
