import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmortExpensesPageComponent } from './amort-expenses-page.component';

describe('AmortExpensesPageComponent', () => {
  let component: AmortExpensesPageComponent;
  let fixture: ComponentFixture<AmortExpensesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmortExpensesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmortExpensesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
