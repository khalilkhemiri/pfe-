import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

interface RapportRendu {
  commentaire?: string;
  fichierUrl?: string;
  dateSoumission?: Date;
  evaluation?: {
    note: number;
    commentaire: string;
    dateEvaluation: Date;
  };
}

interface Tache {
  id: string;
  stagiairesIds: string[];
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  createdAt: Date;
  rapportRendu?: RapportRendu;
}

@Component({
  selector: 'app-evaluation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule
  ],
  template: `
    <div class="evaluation-dialog">
      <h2 mat-dialog-title>Évaluer le rendu</h2>
      
      <mat-dialog-content>
        <div class="rendu-info">
          <h3>Rendu soumis</h3>
          <p><strong>Date de soumission:</strong> {{ data.tache.rapportRendu?.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</p>
          <p><strong>Commentaire du stagiaire:</strong> {{ data.tache.rapportRendu?.commentaire }}</p>
          <a *ngIf="data.tache.rapportRendu?.fichierUrl" [href]="data.tache.rapportRendu.fichierUrl" target="_blank" class="download-link">
            <mat-icon>download</mat-icon>
            Télécharger le fichier
          </a>
        </div>

        <div class="evaluation-form">
          <h3>Votre évaluation</h3>
          
          <div class="note-slider">
            <label>Note sur 10</label>
            <mat-slider
              [min]="0"
              [max]="10"
              [step]="0.5"
              [discrete]="true"
              [(ngModel)]="note"
              (input)="updateNoteLabel($event)">
              <input matSliderThumb>
            </mat-slider>
            <span class="note-value">{{ noteLabel }}</span>
          </div>

          <mat-form-field class="full-width">
            <mat-label>Commentaire d'évaluation</mat-label>
            <textarea
              matInput
              [(ngModel)]="commentaire"
              rows="4"
              placeholder="Donnez votre feedback sur le rendu...">
            </textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isValid()">
          <mat-icon>save</mat-icon>
          Enregistrer l'évaluation
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .evaluation-dialog {
      padding: 24px;
      max-width: 600px;
    }

    .rendu-info {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      h3 {
        color: #2c3e50;
        margin-top: 0;
      }

      p {
        margin: 8px 0;
        color: #666;
      }
    }

    .download-link {
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

    .evaluation-form {
      h3 {
        color: #2c3e50;
        margin-bottom: 16px;
      }
    }

    .note-slider {
      margin-bottom: 24px;

      label {
        display: block;
        margin-bottom: 8px;
        color: #666;
      }

      .note-value {
        display: inline-block;
        margin-left: 16px;
        font-size: 1.2em;
        color: #2c3e50;
        font-weight: 500;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      margin-top: 24px;
      padding: 0;
    }
  `]
})
export class EvaluationDialogComponent {
  note: number = 5;
  noteLabel: string = '5.0';
  commentaire: string = '';

  constructor(
    public dialogRef: MatDialogRef<EvaluationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tache: Tache }
  ) {
    if (data.tache.rapportRendu?.evaluation) {
      this.note = data.tache.rapportRendu.evaluation.note;
      this.noteLabel = this.note.toFixed(1);
      this.commentaire = data.tache.rapportRendu.evaluation.commentaire;
    }
  }

  updateNoteLabel(event: any): void {
    this.noteLabel = event.value.toFixed(1);
  }

  isValid(): boolean {
    return this.note >= 0 && this.note <= 10 && this.commentaire.trim().length > 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const evaluation = {
      note: this.note,
      commentaire: this.commentaire,
      dateEvaluation: new Date()
    };
    this.dialogRef.close(evaluation);
  }
} 