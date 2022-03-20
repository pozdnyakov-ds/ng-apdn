import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeoBsBgsComponent } from './teo-bs-bgs.component';

describe('TeoBsBgsComponent', () => {
  let component: TeoBsBgsComponent;
  let fixture: ComponentFixture<TeoBsBgsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeoBsBgsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeoBsBgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
