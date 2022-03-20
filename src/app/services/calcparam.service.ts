import { HttpClient, HttpParams } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { MainUtilsService } from 'main-utils';
import { APP } from 'src/app-config';

// Параметры расчетов
@Injectable({
  providedIn: 'root'
})
export class CalcparamService {

  constructor(private http: HttpClient,
              private mainUtils: MainUtilsService) { }

    // Получить список параметров
    async getList(): Promise<any> {
      return new Promise((resolve, reject) => {
        // Совсем времянка
        const param = {
          IsNew: false,
          WellId: 12
        };

        this.http.get(APP.apiURL + 'Calcparam/Params', {
          params: new HttpParams().set('IsNew', 'false').set('WellId', '12')
        }).subscribe(value => {
          console.log(value);
          resolve(value);
        }, error => {
          console.log(error);
          reject(error)
        });
      })






/*
      console.log('getList');
      const WEB_PART = 'APDN_GET_CALCPARAMLIST';
      //const restParams = [{paramName: 'pResult', paramValue: json}];
      const restParams = [{
        IsNew: true,
        WellId: 12
      }];

      const data = (await this.mainUtils.data(APP.PORTLET_ID, WEB_PART, restParams));
      return this.mainUtils.metaToFlatFormat(data.data);
*/
  }


      // Добавить параметр
      async addParam(Isnew: boolean, WellId: number, Caption: string, Data: string): Promise<any> {
        return new Promise((resolve, reject) => {

          const param = {
                          IsNew: true,
                          WellId: WellId,
                          Caption: Caption,
                          Data: Data
                        };

          this.http.post(APP.apiURL + 'Calcparam/Params', param).subscribe(value => {
            resolve(value);
          }, error => {
            reject(error)
          });
        })
    }


      // Удалить параметр
      async delParam(Id: number): Promise<any> {
        return new Promise((resolve, reject) => {

          this.http.delete(APP.apiURL + `Calcparam/Params/${Id}`, {
            params: new HttpParams()
          }).subscribe(value => {
            resolve(value);
          }, error => {
            reject(error)
          });
        })
    }


}
