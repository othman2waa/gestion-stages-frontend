import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncadrantListComponent } from './encadrant-list.component';

describe('EncadrantListComponent', () => {
  let component: EncadrantListComponent;
  let fixture: ComponentFixture<EncadrantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncadrantListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncadrantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
