import {Component, EventEmitter, OnInit, Output} from '@angular/core';

export interface NewWell {
  wellName: string;
  explDate: Date;
  udZap: number;
  debitLiqui: number;
  nachObvod: number;
  koeffEkspl: number;

  stoimostBur: number;
  srokAmort: number;
}

@Component({
  selector: 'app-new-well-dialog',
  templateUrl: './new-well-dialog.component.html',
  styleUrls: ['./new-well-dialog.component.styl']
})
export class NewWellDialogComponent implements OnInit {

  @Output() okHandler: EventEmitter<NewWell> = new EventEmitter<NewWell>();
  displayModal = false;
  newWellName: string;

  newWell: NewWell;

  constructor() { }

  ngOnInit(): void {
      this.newWell =  {
        debitLiqui: 0,
        explDate: new Date(),
        koeffEkspl: 0,
        nachObvod: 0,
        udZap: 0,
        wellName: undefined,
        srokAmort: 0,
        stoimostBur: 0
      };
  }

  public showHide( show?: boolean ): void {
    if (show !== undefined && show !== null) {
      this.displayModal = show;
    } else {
      this.displayModal = !this.displayModal;
    }
  }

  okHandlerClick(): void {
    this.displayModal = false;
    // this.okHandler.emit(this.newWellName);
    this.okHandler.emit(this.newWell);
  }
}
