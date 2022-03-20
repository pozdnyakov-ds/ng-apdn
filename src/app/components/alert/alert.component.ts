import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export enum Type {
  yesNo = 'yesNo',
  alert = 'alert'
}

export enum YesNo {
  yes = 1,
  no
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.styl']
})
export class AlertComponent implements OnInit {

  public opened = false;
  @Input() type: Type = Type.alert;
  @Output() yesNoHandler: EventEmitter<YesNo> = new EventEmitter<YesNo>();
  @Output() ok: EventEmitter<void> = new EventEmitter<void>();
  message = '';
  title = '';
  detail = null;
  showDetail = false;
  subscription: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  onOkClick(): void {
    this.ok.emit();
    this.onClose();
  }

  onYesNoHandler(action: string): void {
    if (action === 'yes') {
      this.yesNoHandler.emit(YesNo.yes);
    } else {
      this.yesNoHandler.emit(YesNo.no);
    }
    this.opened = false;
  }

  onClose(): void {
    this.opened = false;
    this.message = null;
    this.detail = null;
  }

  showHide(isShowed: boolean): void {
    this.opened = isShowed;
  }

  show(message: string, detail?): void {
    this.type = Type.alert;
    this.message = message;
    if (detail) {
      this.detail = detail;
    } else {
      this.detail = null;
    }
    this.opened = true;
  }

  showConfirm(title: string, message: string, yesHandler: (value) => void): void {
    console.log('');
    this.type = Type.yesNo;
    this.message = message;
    this.title = title;
    this.subscription = this.yesNoHandler.subscribe(value => {
      // if (value === 'yes') {
      this.subscription.unsubscribe();
      yesHandler(value);
      this.title = "";
      this.message = "";

      // }
    });
    this.opened = true;
  }

}
