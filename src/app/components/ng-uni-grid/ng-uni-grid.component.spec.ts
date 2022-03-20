import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgUniGridComponent } from './ng-uni-grid.component';

describe('NgUniGridComponent', () => {
  let component: NgUniGridComponent;
  let fixture: ComponentFixture<NgUniGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgUniGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgUniGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
