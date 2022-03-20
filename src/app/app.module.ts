import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './view/main/main.component';
import {DropdownModule} from 'primeng/dropdown';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HotTableModule} from '@handsontable/angular';
import {TeoBurComponent} from './view/main/teo-bur/teo-bur.component';
import {TeoBsBgsComponent} from './view/main/teo-bs-bgs/teo-bs-bgs.component';
import {OreComponent} from './view/main/ore/ore.component';
import {ButtonModule} from 'primeng/button';
import {MultiSelectModule} from 'primeng/multiselect';
import {AmortExpensesPageComponent} from './view/main/teo-bur/amort-expenses-page/amort-expenses-page.component';
import {MainDialogComponent} from './components/main-dialog/main-dialog.component';
import {DialogModule} from 'primeng/dialog';
import {DictionariesDialogComponent} from './components/dictionaries-dialog/dictionaries-dialog.component';
import {DictionaryEditorDialogComponent} from './components/dictionary-editor-dialog/dictionary-editor-dialog.component';
import {NgUniGridComponent} from './components/ng-uni-grid/ng-uni-grid.component';
import {TableModule} from 'primeng/table';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {CheckboxModule} from 'primeng/checkbox';
import {InputNumberModule} from 'primeng/inputnumber';
import {AlertComponent} from './components/alert/alert.component';
import {NewWellDialogComponent} from './view/main/teo-bur/new-well-dialog/new-well-dialog.component';
import {CalcPanelComponent} from './view/main/teo-bur/calc-panel/calc-panel.component';
import {NewCalcPlanDialogComponent} from './view/main/teo-bur/calc-panel/new-calc-plan-dialog/new-calc-plan-dialog.component';
import {RadioButtonModule} from 'primeng/radiobutton';
import {EconomicsDialogComponent} from './components/economics-dialog/economics-dialog.component';
import {HandsonDictiEditorComponent} from './components/handson-dicties/handson-dicti-editor/handson-dicti-editor.component';
import {AmortDeductionArrangementPageComponent} from './view/main/teo-bur/amort-deduction-arrangement-page/amort-deduction-page.component';
import {AmortDeductionEquipmentPageComponent} from './view/main/teo-bur/amort-deduction-equipment-page/amort-deduction-page.component';
import {CalendarModule} from 'primeng/calendar';
import localeRu from '@angular/common/locales/ru';
import {registerLocaleData} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CalculationsListDialogComponent } from './view/main/teo-bur/calculations-list-dialog/calculations-list-dialog.component';
import { EkonPageComponent } from './view/main/teo-bur/ekon-page/ekon-page.component';

registerLocaleData(localeRu);

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    TeoBurComponent,
    TeoBsBgsComponent,
    OreComponent,
    AmortDeductionArrangementPageComponent,
    AmortDeductionEquipmentPageComponent,
    AmortExpensesPageComponent,
    MainDialogComponent,
    DictionariesDialogComponent,
    DictionaryEditorDialogComponent,
    NgUniGridComponent,
    AlertComponent,
    NewWellDialogComponent,
    CalcPanelComponent,
    NewCalcPlanDialogComponent,
    EconomicsDialogComponent,
    HandsonDictiEditorComponent,
    CalculationsListDialogComponent,
    EkonPageComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        DropdownModule,
        SelectButtonModule,
        FormsModule,
        ReactiveFormsModule,
        HotTableModule,
        ButtonModule,
        MultiSelectModule,
        DialogModule,
        TableModule,
        RippleModule,
        InputTextModule,
        CheckboxModule,
        InputNumberModule,
        RadioButtonModule,
        CalendarModule,
        HttpClientModule
    ],
  providers: [
    {provide: LOCALE_ID, useValue: 'ru-RU'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
