import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OreComponent } from './ore.component';

describe('OreComponent', () => {
  let component: OreComponent;
  let fixture: ComponentFixture<OreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
