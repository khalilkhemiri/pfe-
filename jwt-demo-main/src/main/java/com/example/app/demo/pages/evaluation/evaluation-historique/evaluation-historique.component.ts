import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth/auth.service';
import { EvaluationService } from '../../../service/evaluation/evaluation.service';

export interface EvaluationHistorique {
  id: string;
  dateEvaluation: string;
  moyenneGlobale: number;
  statut: string;
  commentaire: string;
  criteres: any[];
}

@Component({
  selector: 'app-evaluation-historique',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule
  ],
  templateUrl: './evaluation-historique.component.html',
  styleUrls: ['./evaluation-historique.component.scss']
})
export class EvaluationHistoriqueComponent implements OnInit {
  stagiaire: any;
  evaluations: EvaluationHistorique[] = [];
  displayedColumns: string[] = ['date', 'moyenne', 'statut', 'commentaire', 'actions'];
  loading = false;
  selectedTab = 0;

  // Ajouter Math comme propriété pour l'utiliser dans le template
  Math = Math;

  // Statistiques
  stats = {
    moyenneGlobale: 0,
    nombreEvaluations: 0,
    meilleureNote: 0,
    pireNote: 10,
    evolution: 'stable'
  };

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.loadStagiaire();
    this.loadEvaluations();
  }

  loadStagiaire(): void {
    const stagiaireId = this.route.snapshot.paramMap.get('id');
    if (stagiaireId) {
      this.authService.getStagiaireById(stagiaireId).subscribe({
        next: (stagiaire) => {
          this.stagiaire = stagiaire;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du stagiaire:', error);
        }
      });
    }
  }

  loadEvaluations(): void {
    const stagiaireId = this.route.snapshot.paramMap.get('id');
    if (stagiaireId) {
      this.loading = true;
      this.evaluationService.getEvaluationsByStagiaire(stagiaireId).subscribe({
        next: (evaluations) => {
          this.evaluations = evaluations;
          this.calculerStatistiques();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des évaluations:', error);
          this.loading = false;
        }
      });
    }
  }

  calculerStatistiques(): void {
    if (this.evaluations.length === 0) return;

    const moyennes = this.evaluations.map(e => e.moyenneGlobale);
    this.stats.moyenneGlobale = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    this.stats.nombreEvaluations = this.evaluations.length;
    this.stats.meilleureNote = Math.max(...moyennes);
    this.stats.pireNote = Math.min(...moyennes);

    // Calculer l'évolution
    if (this.evaluations.length >= 2) {
      const derniere = this.evaluations[0].moyenneGlobale;
      const avantDerniere = this.evaluations[1].moyenneGlobale;
      if (derniere > avantDerniere) {
        this.stats.evolution = 'amélioration';
      } else if (derniere < avantDerniere) {
        this.stats.evolution = 'dégradation';
      } else {
        this.stats.evolution = 'stable';
      }
    }
  }

  getStatutColor(statut: string): string {
    return this.evaluationService.getStatutColor(statut);
  }

  getStatutIcon(statut: string): string {
    return this.evaluationService.getStatutIcon(statut);
  }

  getEvolutionIcon(): string {
    switch (this.stats.evolution) {
      case 'amélioration': return 'trending_up';
      case 'dégradation': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getEvolutionColor(): string {
    switch (this.stats.evolution) {
      case 'amélioration': return '#4caf50';
      case 'dégradation': return '#f44336';
      default: return '#ff9800';
    }
  }

  voirDetails(evaluation: EvaluationHistorique): void {
    // Navigation vers les détails de l'évaluation
    console.log('Voir détails:', evaluation);
  }

  exporterRapport(): void {
    // Export du rapport d'évaluation
    console.log('Export du rapport');
  }

  // Méthode pour générer un tableau d'étoiles
  getStars(note: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  // Méthode pour vérifier si une étoile doit être remplie
  isStarFilled(starIndex: number, note: number): boolean {
    return starIndex <= Math.round(note / 2);
  }
} 