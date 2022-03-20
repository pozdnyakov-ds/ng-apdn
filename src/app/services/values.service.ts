import { Injectable } from '@angular/core';
import { Field, Mnk, OE, Well } from './common-data.service';

@Injectable({
  providedIn: 'root'
})
export class ValuesService {
  /** МНК */
  private mnk: Mnk;
  /** Месторождение */
  private field: Field;
  /** Эксплуатационный объект */
  private  oe: Array<OE>;
  /** Скважина */
  private well: Well;
  /** Актуальный период */
  private period = -1;
  /** Новая(для новых)/Пробуренная */
  private isNewWell = false;

  constructor() { }

  /** Установка МНК */
  setMnk(mnk: Mnk): void {
    this.mnk = mnk;
  }
  /** Выбранное мнк */
  getMnk(): Mnk {
    return this.mnk;
  }
  /** Установка месторождения */
  setField(field: Field): void {
    this.field = field;
  }
  /** Выбранное месторождение */
  getField(): Field {
    return this.field;
  }
  /** Установка эксплуатационного объекта */
  setOE(oe: Array<OE>): void {
    this.oe = oe;
  }
  /** Выбранный эксплуатационный объект */
  getOE(): Array<OE> {
    return this.oe;
  }
  /** Установка скважины */
  setWell(well: Well): void {
    this.well = well;
  }
  /** Выбранная скважина */
  getWell(): Well{
    return this.well;
  }
  /** Установка выбранного периода */
  setActualPeriod(period: number): void {
    this.period = period;
  }
  /** Установленный период */
  getActualPeriod(): number {
    return this.period;
  }
  /**
   * Новая/пробуренная скважина
   */
  isNew(): boolean {
    return  this.isNewWell;
  }
  /**
   * Установка флага новая/пробуренная скважина
   */
  setIsNew(value: boolean): void {
    this.isNewWell = value;
  }
}
