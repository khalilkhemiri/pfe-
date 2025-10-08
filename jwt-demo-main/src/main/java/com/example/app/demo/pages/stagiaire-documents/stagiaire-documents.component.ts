import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface DocumentType {
  label: string;
  key: string;
  file?: UploadedFile;
  preview?: string | null;
  isImage?: boolean;
  errorMessage?: string;
}

interface UploadedFile {
  name: string;
  type: string;
  status: 'pending' | 'uploaded' | 'rejected';
  progress: number;
  url?: string;
  publicId?: string; // Pour suppression Cloudinary
}

@Component({
  selector: 'app-stagiaire-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stagiaire-documents.component.html',
  styleUrls: ['./stagiaire-documents.component.scss']
})
export class StagiaireDocumentsComponent implements OnInit {

  stagiaireId!: string;
  documentTypes: DocumentType[] = [
    { label: 'Attestation de stage', key: 'attestation' },
    { label: 'Convention de stage', key: 'convention' },
    { label: 'Rapport de stage', key: 'rapport' },
    { label: 'Autre document', key: 'autre' }
  ];

  downloadingTemplate: boolean = false;
  templateError: string | null = null;
  private ATT_TEMPLATE_ASSET = '/assets/images/unsigned.jpg';

  constructor(private http: HttpClient, private authService: AuthService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.stagiaireId = this.authService.getCurrentUserId();
    this.loadDocuments();
  }

  // Charger les documents existants
  loadDocuments() {
    this.http.get<any[]>(`http://localhost:8080/api/documents/stagiaire/${this.stagiaireId}`)
      .subscribe(docs => {
        docs.forEach(d => {
          const docType = this.documentTypes.find(dt => dt.key === d.type);
          if (docType) {
            docType.file = {
              name: d.fileName,
              type: '', 
              status: 'uploaded',
              progress: 100,
              url: d.url,
              publicId: d.publicId
            };
            docType.preview = d.url?.match(/\.(jpg|png|jpeg|gif)$/i) ? d.url : null;
            docType.isImage = !!docType.preview;
          }
        });
      });
  }

  // Sélection et prévisualisation
  onFileSelected(event: any, doc: DocumentType) {
    const file = event.target.files[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    // Block files that contain 'unsigned' in their filename
    if (lowerName.includes('unsigned')) {
      doc.file = { name: file.name, type: file.type, status: 'rejected', progress: 0 };
      doc.preview = null;
      doc.isImage = false;
      doc.errorMessage = "Ce fichier n'est pas signé — veuillez télécharger la version signée.";
      return;
    }

    // Clear previous error if any
    doc.errorMessage = undefined;

    doc.file = { name: file.name, type: file.type, status: 'pending', progress: 0 };
    doc.isImage = file.type.startsWith('image/');

    if (doc.isImage) {
      const reader = new FileReader();
      reader.onload = (e: any) => doc.preview = e.target.result;
      reader.readAsDataURL(file);
    } else {
      doc.preview = null;
    }

    this.uploadFile(file, doc);
  }

  // Remove a rejected (blocked) file locally
  removeRejected(doc: DocumentType) {
    doc.file = undefined;
    doc.preview = null;
    doc.isImage = false;
    doc.errorMessage = undefined;
  }

  // Upload vers le backend
  uploadFile(file: File, doc: DocumentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', doc.key);
    formData.append('stagiaireId', this.stagiaireId);

    this.http.post('http://localhost:8080/api/documents/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        doc.file!.progress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        doc.file!.status = 'uploaded';
        const body = event.body as { url: string, publicId: string };
        doc.file!.url = body.url;
        doc.file!.publicId = body.publicId;
      }
    });
  }

  // Supprimer un document
  deleteFile(doc: DocumentType) {
    if (!doc.file?.publicId) return;

    this.http.delete(`http://localhost:8080/api/documents/${doc.file.publicId}`)
      .subscribe(() => {
        doc.file = undefined;
        doc.preview = null;
        doc.isImage = false;
      });
  }

  // Sécuriser l'URL des PDF
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Télécharger le modèle d'attestation depuis assets
  downloadAttestationTemplate() {
    this.downloadingTemplate = true;
    this.templateError = null;
    try {
      const a = document.createElement('a');
      a.href = this.ATT_TEMPLATE_ASSET;
      a.download = 'attestation_unsigned.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.downloadingTemplate = false;
    } catch (err) {
      console.error('Erreur téléchargement template (asset):', err);
      this.downloadingTemplate = false;
      this.templateError = 'Impossible de télécharger le modèle pour le moment.';
    }
  }

  previewAttestationTemplate() {
    this.downloadingTemplate = true;
    this.templateError = null;
    try {
      window.open(this.ATT_TEMPLATE_ASSET, '_blank');
      this.downloadingTemplate = false;
    } catch (err) {
      console.error('Erreur preview template (asset):', err);
      this.downloadingTemplate = false;
      this.templateError = 'Impossible de prévisualiser le modèle pour le moment.';
    }
  }
}
