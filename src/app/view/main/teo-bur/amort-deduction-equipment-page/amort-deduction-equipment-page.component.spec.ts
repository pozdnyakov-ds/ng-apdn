import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmortDeductionPageComponent } from './amort-deduction-page.component';

describe('AmortDeductionPageComponent', () => {
  let component: AmortDeductionPageComponent;
  let fixture: ComponentFixture<AmortDeductionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmortDeductionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmortDeductionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
