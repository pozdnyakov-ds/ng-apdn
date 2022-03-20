import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCalcPlanDialogComponent } from './new-calc-plan-dialog.component';

describe('NewCalcPlanDialogComponent', () => {
  let component: NewCalcPlanDialogComponent;
  let fixture: ComponentFixture<NewCalcPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCalcPlanDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCalcPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
