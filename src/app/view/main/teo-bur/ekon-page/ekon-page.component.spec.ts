import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EkonPageComponent } from './ekon-page.component';

describe('EkonPageComponent', () => {
  let component: EkonPageComponent;
  let fixture: ComponentFixture<EkonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EkonPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EkonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
