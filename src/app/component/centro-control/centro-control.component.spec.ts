import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroControlComponent } from './centro-control.component';

describe('CentroControlComponent', () => {
  let component: CentroControlComponent;
  let fixture: ComponentFixture<CentroControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentroControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
