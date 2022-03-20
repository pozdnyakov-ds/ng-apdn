import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationsListDialogComponent } from './calculations-list-dialog.component';

describe('CalculationsListDialogComponent', () => {
  let component: CalculationsListDialogComponent;
  let fixture: ComponentFixture<CalculationsListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculationsListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationsListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
