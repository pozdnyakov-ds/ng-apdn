import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeoBurComponent } from './teo-bur.component';

describe('TeoBurComponent', () => {
  let component: TeoBurComponent;
  let fixture: ComponentFixture<TeoBurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeoBurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeoBurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
