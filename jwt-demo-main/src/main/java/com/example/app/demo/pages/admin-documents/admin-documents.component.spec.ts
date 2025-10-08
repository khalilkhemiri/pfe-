import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDocumentsComponent } from './admin-documents.component';

describe('AdminDocumentsComponent', () => {
  let component: AdminDocumentsComponent;
  let fixture: ComponentFixture<AdminDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
