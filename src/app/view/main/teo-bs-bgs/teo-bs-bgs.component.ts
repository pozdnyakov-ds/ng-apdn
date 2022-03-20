import { Component, OnInit } from '@angular/core';
import {clearData as data} from '../teo-bur/example-data/clearData';


@Component({
  selector: 'app-teo-bs-bgs',
  templateUrl: './teo-bs-bgs.component.html',
  styleUrls: ['./teo-bs-bgs.component.styl']
})
export class TeoBsBgsComponent implements OnInit {

  // Скважины
  wellsDs: Array<{name: string, value: any}>;
  selectedWell: {name: string, value: any};

  id = 'hotInstance2';
  private rows10: { len: number };
  private rows: any;

  constructor() { }

  ngOnInit(): void {
  }
}
