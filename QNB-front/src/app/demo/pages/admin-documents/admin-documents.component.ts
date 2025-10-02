import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService, Stagiaire } from 'src/app/demo/service/auth/auth.service';
import { FormsModule } from '@angular/forms';

interface DocumentEntity {
  id: string;
  fileName: string;
  url: string;
  publicId?: string;
  type?: string;
}

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-documents.component.html',
  styleUrls: ['./admin-documents.component.scss']
})
export class AdminDocumentsComponent implements OnInit {
  stagiaires: Stagiaire[] = [];
  filtered: Stagiaire[] = [];
  selectedStagiaire: Stagiaire | null = null;
  documents: DocumentEntity[] = [];
  query: string = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadStagiaires();
  }

  loadStagiaires() {
    this.auth.getAllStagiaires().subscribe(list => {
      this.stagiaires = list || [];
      this.filtered = this.stagiaires;
    });
  }

  search() {
    const q = this.query.trim().toLowerCase();
    if (!q) this.filtered = this.stagiaires;
    else this.filtered = this.stagiaires.filter(s =>
      (s.username || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
    );
  }

  selectStagiaire(s: Stagiaire) {
    this.selectedStagiaire = s;
    this.loadDocuments(s.id);
  }

  loadDocuments(stagiaireId: string) {
    this.http.get<DocumentEntity[]>(`http://localhost:8080/api/documents/stagiaire/${stagiaireId}`).subscribe(docs => {
      this.documents = docs || [];
    });
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Helper to check file types (used in template)
  isImageUrl(url?: string): boolean {
    return !!url && /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isPdfUrl(url?: string): boolean {
    return !!url && /\.pdf$/i.test(url);
  }

  download(url: string) {
    window.open(url, '_blank');
  }

  deleteDocument(doc: DocumentEntity) {
    if (!doc.publicId) return;
    this.http.delete(`http://localhost:8080/api/documents/${doc.publicId}`).subscribe(() => {
      this.documents = this.documents.filter(d => d.publicId !== doc.publicId);
    });
  }
}
