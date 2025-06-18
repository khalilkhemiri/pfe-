import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TacheService } from '../../service/tache/tache.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TacheDetailDialogComponent } from './tache-detail-dialog.component';

enum StatutTache {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

interface RapportRendu {
  commentaire?: string;
  fichierUrl?: string;
  dateSoumission?: Date;
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
  selector: 'app-tache-stagiaire',
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
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './tache-stagiaire.component.html',
  styleUrls: ['./tache-stagiaire.component.scss']
})
export class TacheStagiaireComponent implements OnInit {
  taches: Tache[] = [];
  filteredTaches: Tache[] = [];
  selectedFilter: string = 'all';
  stagiaireId = '67fe6e2ce170de1a3b628a4d';
  StatutTache = StatutTache;

  constructor(
    private tacheService: TacheService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTaches();
  }

  loadTaches() {
    this.http.get<Tache[]>(`http://localhost:8080/api/taches/stagiaire/${this.stagiaireId}`).subscribe({
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
    switch (this.selectedFilter) {
      case 'pending':
        this.filteredTaches = this.taches.filter(tache => tache.statut !== StatutTache.TERMINEE);
        break;
      case 'completed':
        this.filteredTaches = this.taches.filter(tache => tache.statut === StatutTache.TERMINEE);
        break;
      default:
        this.filteredTaches = this.taches;
    }
  }

  isUrgent(tache: Tache): boolean {
    const now = new Date();
    const deadline = new Date(tache.dateFin);
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDeadline <= 3 && tache.statut !== StatutTache.TERMINEE;
  }

  getStatusClass(tache: Tache): string {
    switch (tache.statut) {
      case StatutTache.TERMINEE:
        return 'completed';
      case StatutTache.EN_COURS:
        return 'in-progress';
      default:
        return this.isUrgent(tache) ? 'urgent' : 'pending';
    }
  }

  getStatusText(tache: Tache): string {
    switch (tache.statut) {
      case StatutTache.TERMINEE:
        return 'Terminée';
      case StatutTache.EN_COURS:
        return 'En cours';
      case StatutTache.EN_ATTENTE:
        return this.isUrgent(tache) ? 'Urgent' : 'En attente';
      default:
        return 'En attente';
    }
  }

  showDetail(tache: Tache) {
    const dialogRef = this.dialog.open(TacheDetailDialogComponent, {
      width: '600px',
      data: { tache }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tacheService.envoyerRendu(result.tacheId, result.formData).subscribe({
          next: () => {
            this.snackBar.open('Rendu envoyé avec succès!', 'Fermer', { duration: 3000 });
            this.loadTaches();
          },
          error: (err) => {
            console.error('Erreur lors du rendu', err);
            this.snackBar.open('Erreur lors de l\'envoi du rendu', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }
}