import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MainUtilsService } from 'main-utils';
import { APP } from 'src/app-config';

@Injectable({
  providedIn: 'root',
})
export class ParusLoaderService {
  constructor(private mainUtils: MainUtilsService, private http: HttpClient) {}

  async LoadAmort(val: any): Promise<any> {
    console.log('load Amort from Parus');
    const WEB_PART = 'APDN_PARUS_AMORT';

    const restParams = [
      {
        paramName: 'body',
        paramValue: JSON.stringify(val),
      },
    ];

    const data = await this.mainUtils.data(
      APP.PORTLET_ID,
      WEB_PART,
      restParams
    );
    return data.data; //this.mainUtils.metaToFlatFormat(data.data);
  }


  /*async LoadAmort2(val: any): Promise<any> {
    //return this.http.post('http://10.1.5.205:5022/api/ParusImport/Amort', JSON.stringify(val));

    var res = this.http.post(
      'http://localhost:27805/api/ParusImport/Amort',
      val
    );
    res.subscribe(
      (posts) => {
        var res2 = posts;
        return res2;
      },
      (error) => {
        return error;

      }
    );
    // Возврат синхронно?

	  //this.http.post('http://localhost:27805/api/ParusImport/Amort', val)
	  //.pipe((response: any) => {

		//return response;
		//});
  }*/

}
