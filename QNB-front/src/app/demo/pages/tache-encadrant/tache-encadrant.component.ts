import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';

interface Stagiaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

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
  selector: 'app-tache-encadrant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="encadrant-container">
      <div class="header">
        <h1>Gestion des Tâches des Stagiaires</h1>
        <div class="filters">
          <mat-form-field>
            <mat-label>Filtrer par stagiaire</mat-label>
            <mat-select [(ngModel)]="selectedStagiaire" (selectionChange)="applyFilter()">
              <mat-option value="all">Tous les stagiaires</mat-option>
              <mat-option *ngFor="let stagiaire of stagiaires" [value]="stagiaire.id">
                {{ stagiaire.prenom }} {{ stagiaire.nom }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Tâches en attente d'évaluation">
          <div class="taches-grid">
            <mat-card *ngFor="let tache of tachesEnAttente" class="tache-card">
              <mat-card-header>
                <mat-card-title>{{ tache.titre }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="stagiaire-info">
                    Stagiaire: {{ getStagiaireName(tache.stagiairesIds[0]) }}
                  </span>
                  <span class="date">Date limite: {{ tache.dateFin | date:'dd/MM/yyyy HH:mm' }}</span>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="description">{{ tache.description }}</p>
                <div class="rendu-info" *ngIf="tache.rapportRendu">
                  <h4>Rendu soumis le: {{ tache.rapportRendu.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</h4>
                  <p><strong>Commentaire du stagiaire:</strong> {{ tache.rapportRendu.commentaire }}</p>
                  <a *ngIf="tache.rapportRendu.fichierUrl" [href]="tache.rapportRendu.fichierUrl" target="_blank" class="download-link">
                    <mat-icon>download</mat-icon>
                    Télécharger le fichier
                  </a>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="evaluateRendu(tache)">
                  <mat-icon>grade</mat-icon>
                  Évaluer
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Tâches évaluées">
          <div class="taches-grid">
            <mat-card *ngFor="let tache of tachesEvaluees" class="tache-card">
              <mat-card-header>
                <mat-card-title>{{ tache.titre }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="stagiaire-info">
                    Stagiaire: {{ getStagiaireName(tache.stagiairesIds[0]) }}
                  </span>
                  <span class="evaluation-date">
                    Évaluée le: {{ tache.rapportRendu?.evaluation?.dateEvaluation | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="evaluation-info">
                  <div class="note">
                    <mat-icon>star</mat-icon>
                    <span>Note: {{ tache.rapportRendu?.evaluation?.note }}/10</span>
                  </div>
                  <p><strong>Commentaire d'évaluation:</strong> {{ tache.rapportRendu?.evaluation?.commentaire }}</p>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-raised-button color="accent" (click)="modifyEvaluation(tache)">
                  <mat-icon>edit</mat-icon>
                  Modifier l'évaluation
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .encadrant-container {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .taches-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      padding: 24px 0;
    }

    .tache-card {
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .stagiaire-info {
      display: block;
      color: #666;
      margin-bottom: 8px;
    }

    .description {
      color: #666;
      margin: 16px 0;
    }

    .rendu-info {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;

      h4 {
        margin: 0 0 8px 0;
        color: #2c3e50;
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

    .evaluation-info {
      background-color: #e9ecef;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;

      .note {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #2c3e50;
        font-size: 1.2em;
        margin-bottom: 8px;

        mat-icon {
          color: #ffc107;
        }
      }

      p {
        margin: 8px 0;
        color: #666;
      }
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class TacheEncadrantComponent implements OnInit {
  taches: Tache[] = [];
  stagiaires: Stagiaire[] = [];
  selectedStagiaire: string = 'all';
  tachesEnAttente: Tache[] = [];
  tachesEvaluees: Tache[] = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStagiaires();
    this.loadTaches();
  }

  loadStagiaires() {
    this.http.get<Stagiaire[]>('http://localhost:8080/api/stagiaires').subscribe({
      next: (data) => {
        this.stagiaires = data;
      },
      error: (err) => {
        console.error('Erreur de chargement des stagiaires', err);
        this.snackBar.open('Erreur lors du chargement des stagiaires', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadTaches() {
    this.http.get<Tache[]>('http://localhost:8080/api/taches').subscribe({
      next: (data) => {
        this.taches = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erreur de chargement des tâches', err);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 });
      }
    });
  }

  applyFilter() {
    let filteredTaches = this.taches;
    
    if (this.selectedStagiaire !== 'all') {
      filteredTaches = filteredTaches.filter(tache => 
        tache.stagiairesIds.includes(this.selectedStagiaire)
      );
    }

    this.tachesEnAttente = filteredTaches.filter(tache => 
      tache.rapportRendu && !tache.rapportRendu.evaluation
    );

    this.tachesEvaluees = filteredTaches.filter(tache => 
      tache.rapportRendu && tache.rapportRendu.evaluation
    );
  }

  getStagiaireName(stagiaireId: string): string {
    const stagiaire = this.stagiaires.find(s => s.id === stagiaireId);
    return stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : 'Stagiaire inconnu';
  }

  evaluateRendu(tache: Tache) {
    // TODO: Implémenter la logique d'évaluation
    console.log('Évaluer le rendu de la tâche:', tache);
  }

  modifyEvaluation(tache: Tache) {
    // TODO: Implémenter la logique de modification d'évaluation
    console.log('Modifier l\'évaluation de la tâche:', tache);
  }
}