import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface RapportRendu {
  commentaire?: string;
  fichierUrl?: string;
  dateSoumission?: Date;
}

enum StatutTache {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

interface Tache {
  id: string;
  stagiairesIds: string[];
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  statut: StatutTache;
  createdAt: Date;
  rapportRendu?: RapportRendu;
}

@Component({
  selector: 'app-tache-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ data.tache.titre }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="info-section">
          <h3>Description</h3>
          <p>{{ data.tache.description }}</p>
        </div>

        <div class="info-section">
          <h3>Détails</h3>
          <ul>
            <li><strong>Date de début:</strong> {{ data.tache.dateDebut | date:'dd/MM/yyyy HH:mm' }}</li>
            <li><strong>Date limite:</strong> {{ data.tache.dateFin | date:'dd/MM/yyyy HH:mm' }}</li>
            <li><strong>Statut:</strong> {{ getStatusText(data.tache) }}</li>
            <li><strong>Créée le:</strong> {{ data.tache.createdAt | date:'dd/MM/yyyy HH:mm' }}</li>
          </ul>
        </div>

        <div class="rendu-section" *ngIf="data.tache.statut !== StatutTache.TERMINEE">
          <h3>Soumettre un rendu</h3>
          <mat-form-field class="full-width">
            <mat-label>Commentaire</mat-label>
            <textarea matInput [(ngModel)]="renduText" rows="3"></textarea>
          </mat-form-field>

          <div class="file-upload">
            <button mat-raised-button (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
              Sélectionner un fichier
            </button>
            <input #fileInput type="file" (change)="onFileSelected($event)" style="display: none">
            <span class="file-name" *ngIf="renduFile">{{ renduFile.name }}</span>
          </div>

          <button mat-raised-button color="primary" (click)="submitRendu()" class="submit-button">
            <mat-icon>send</mat-icon>
            Envoyer le rendu
          </button>
        </div>

        <div class="rendu-info" *ngIf="data.tache.rapportRendu">
          <h3>Rendu précédent</h3>
          <p><strong>Date de soumission:</strong> {{ data.tache.rapportRendu.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</p>
          <p><strong>Commentaire:</strong> {{ data.tache.rapportRendu.commentaire }}</p>
          <a *ngIf="data.tache.rapportRendu.fichierUrl" [href]="data.tache.rapportRendu.fichierUrl" target="_blank">
            <mat-icon>download</mat-icon>
            Télécharger le fichier
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .info-section {
      margin-bottom: 24px;

      h3 {
        color: #2c3e50;
        margin-bottom: 12px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;

          strong {
            color: #2c3e50;
            min-width: 120px;
          }
        }
      }
    }

    .rendu-section {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      h3 {
        margin-top: 0;
        color: #2c3e50;
      }
    }

    .rendu-info {
      background-color: #e9ecef;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;

      h3 {
        color: #2c3e50;
        margin-top: 0;
      }

      p {
        margin: 8px 0;
        color: #666;
      }

      a {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #2196f3;
        text-decoration: none;
        margin-top: 8px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .file-upload {
      margin: 16px 0;
      display: flex;
      align-items: center;
      gap: 12px;

      .file-name {
        color: #666;
        font-size: 14px;
      }
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      width: 100%;
      margin-top: 16px;
    }
  `]
})
export class TacheDetailDialogComponent {
  renduText: string = '';
  renduFile: File | null = null;
  StatutTache = StatutTache;

  constructor(
    public dialogRef: MatDialogRef<TacheDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tache: Tache }
  ) {
    if (data.tache.rapportRendu) {
      this.renduText = data.tache.rapportRendu.commentaire || '';
    }
  }

  getStatusText(tache: Tache): string {
    switch (tache.statut) {
      case StatutTache.TERMINEE:
        return 'Terminée';
      case StatutTache.EN_COURS:
        return 'En cours';
      case StatutTache.EN_ATTENTE:
        return 'En attente';
      default:
        return 'En attente';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    this.renduFile = event.target.files[0];
  }

  submitRendu(): void {
    const formData = new FormData();
    formData.append('commentaire', this.renduText);
    if (this.renduFile) {
      formData.append('file', this.renduFile);
    }
    this.dialogRef.close({ formData, tacheId: this.data.tache.id });
  }
} 