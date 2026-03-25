import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireLayoutComponent } from './stagiaire-layout.component';

describe('StagiaireLayoutComponent', () => {
  let component: StagiaireLayoutComponent;
  let fixture: ComponentFixture<StagiaireLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
