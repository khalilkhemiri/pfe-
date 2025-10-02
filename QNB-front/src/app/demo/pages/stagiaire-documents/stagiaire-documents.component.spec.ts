import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireDocumentsComponent } from './stagiaire-documents.component';

describe('StagiaireDocumentsComponent', () => {
  let component: StagiaireDocumentsComponent;
  let fixture: ComponentFixture<StagiaireDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
