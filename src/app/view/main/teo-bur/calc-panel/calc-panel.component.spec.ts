import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcPanelComponent } from './calc-panel.component';

describe('CalcPanelComponent', () => {
  let component: CalcPanelComponent;
  let fixture: ComponentFixture<CalcPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalcPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
