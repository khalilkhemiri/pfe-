import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../service/auth/auth.service';
import { EvaluationService } from '../../../service/evaluation/evaluation.service';
import { TacheService } from '../../../service/tache/tache.service';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule
  ],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrls: ['./evaluation-dashboard.component.scss']
})
export class EvaluationDashboardComponent implements OnInit {
  stagiaires: any[] = [];
  evaluations: any[] = [];
  stats: any = {};
  loading = true;
  refreshing = false;
  displayedColumns: string[] = ['stagiaire', 'moyenne', 'taches', 'derniereEvaluation', 'statut', 'actions'];
  stagiairesAffiches: any[] = []; // Tableau enrichi pour le dataSource

  constructor(
    private router: Router,
    private authService: AuthService,
    private evaluationService: EvaluationService,
    private tacheService: TacheService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const tuteurId = this.authService.getCurrentUserId();
    
    console.log('Tuteur ID:', tuteurId); // Debug
    
    if (!tuteurId) {
      this.loading = false;
      this.snackBar.open('Erreur: ID du tuteur non trouvé. Veuillez vous reconnecter.', 'Fermer', {
        duration: 5000
      });
      return;
    }
    
    // Charger les stagiaires du tuteur
    this.authService.getStagiairesByTuteur(tuteurId).subscribe({
      next: (stagiaires) => {
        this.stagiaires = stagiaires;
        this.loadEvaluations(tuteurId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stagiaires:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  loadEvaluations(tuteurId: string): void {
    this.evaluationService.getEvaluationsByTuteur(tuteurId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.calculateStats();
        this.enrichStagiaires();
        this.loadTachesForStagiaires(); // Charger les tâches pour chaque stagiaire
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des évaluations', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  loadTachesForStagiaires(): void {
    this.stagiairesAffiches.forEach((stagiaire, idx) => {
      this.tacheService.getTachesDuStagiaire(stagiaire.id).subscribe({
        next: (taches) => {
          const nombreTaches = taches.length;
          const tachesTerminees = taches.filter(t => t.statut === 'terminee' || t.statut === 'terminée').length;
          this.stagiairesAffiches[idx].nombreTaches = nombreTaches;
          this.stagiairesAffiches[idx].tachesTerminees = tachesTerminees;
        },
        error: () => {
          this.stagiairesAffiches[idx].nombreTaches = 0;
          this.stagiairesAffiches[idx].tachesTerminees = 0;
        }
      });
    });
  }

  enrichStagiaires(): void {
    this.stagiairesAffiches = this.stagiaires.map(stagiaire => {
      const evals = this.evaluations.filter(e => e.stagiaireId === stagiaire.id);
      const moyenneGlobale = evals.length > 0 ? Math.round((evals.reduce((sum, e) => sum + e.moyenneGlobale, 0) / evals.length) * 10) / 10 : 0;
      const statut = evals.length > 0 ? evals[0].statut : 'insuffisant';
      const tachesTerminees = stagiaire.tachesTerminees || 0;
      const nombreTaches = stagiaire.nombreTaches || 0;
      const derniereEvaluation = evals.length > 0 ? evals[0].dateEvaluation : 'Aucune tâche';
      return {
        ...stagiaire,
        moyenneGlobale,
        statut,
        tachesTerminees,
        nombreTaches,
        derniereEvaluation
      };
    });
  }

  calculateStats(): void {
    if (this.evaluations.length === 0) {
      this.stats = {
        totalEvaluations: 0,
        moyenneGlobale: 0,
        repartition: { excellent: 0, bon: 0, moyen: 0, insuffisant: 0 },
        evaluationsRecentes: []
      };
      return;
    }

    // Calculer la moyenne globale
    const moyenneGlobale = this.evaluations.reduce((sum, evaluation) => sum + evaluation.moyenneGlobale, 0) / this.evaluations.length;

    // Calculer la répartition par statut
    const repartition = {
      excellent: this.evaluations.filter(e => e.statut === 'excellent').length,
      bon: this.evaluations.filter(e => e.statut === 'bon').length,
      moyen: this.evaluations.filter(e => e.statut === 'moyen').length,
      insuffisant: this.evaluations.filter(e => e.statut === 'insuffisant').length
    };

    // Évaluations récentes (5 dernières)
    const evaluationsRecentes = this.evaluations
      .sort((a, b) => new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime())
      .slice(0, 5);

    this.stats = {
      totalEvaluations: this.evaluations.length,
      moyenneGlobale: Math.round(moyenneGlobale * 10) / 10,
      repartition,
      evaluationsRecentes
    };
  }

  getStagiaireStats(stagiaireId: string): any {
    const evaluationsStagiaire = this.evaluations.filter(e => e.stagiaireId === stagiaireId);
    
    if (evaluationsStagiaire.length === 0) {
      return {
        nombreEvaluations: 0,
        moyenneGlobale: 0,
        meilleureNote: 0,
        evolution: 'stable'
      };
    }

    const moyenneGlobale = evaluationsStagiaire.reduce((sum, evaluation) => sum + evaluation.moyenneGlobale, 0) / evaluationsStagiaire.length;
    const meilleureNote = Math.max(...evaluationsStagiaire.map(e => e.moyenneGlobale));
    
    let evolution = 'stable';
    if (evaluationsStagiaire.length >= 2) {
      const derniere = evaluationsStagiaire[0].moyenneGlobale;
      const avantDerniere = evaluationsStagiaire[1].moyenneGlobale;
      if (derniere > avantDerniere) evolution = 'amélioration';
      else if (derniere < avantDerniere) evolution = 'dégradation';
    }

    return {
      nombreEvaluations: evaluationsStagiaire.length,
      moyenneGlobale: Math.round(moyenneGlobale * 10) / 10,
      meilleureNote: Math.round(meilleureNote * 10) / 10,
      evolution
    };
  }

  // Méthodes pour les statistiques
  getExcellentCount(): number {
    return this.stats.repartition?.excellent || 0;
  }

  getBonCount(): number {
    return this.stats.repartition?.bon || 0;
  }

  getMoyenCount(): number {
    return this.stats.repartition?.moyen || 0;
  }

  getInsuffisantCount(): number {
    return this.stats.repartition?.insuffisant || 0;
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'excellent': return 'star';
      case 'bon': return 'thumb_up';
      case 'moyen': return 'trending_up';
      case 'insuffisant': return 'warning';
      default: return 'help';
    }
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'excellent': return '#4caf50';
      case 'bon': return '#2196f3';
      case 'moyen': return '#ff9800';
      case 'insuffisant': return '#f44336';
      default: return '#757575';
    }
  }

  getEvolutionIcon(evolution: string): string {
    switch (evolution) {
      case 'amélioration': return 'trending_up';
      case 'dégradation': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getEvolutionColor(evolution: string): string {
    switch (evolution) {
      case 'amélioration': return '#4caf50';
      case 'dégradation': return '#f44336';
      default: return '#757575';
    }
  }

  // Méthodes pour les étoiles
  getStars(moyenne: number): number[] {
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }

  isStarFilled(starIndex: number, moyenne: number): boolean {
    return starIndex <= moyenne;
  }

  getStarIcon(starIndex: number, moyenne: number): string {
    return this.isStarFilled(starIndex, moyenne) ? 'star' : 'star_border';
  }

  // Méthodes pour le progrès
  getProgressPercentage(stagiaire: any): number {
    return stagiaire.nombreTaches > 0 ? Math.round((stagiaire.tachesTerminees / stagiaire.nombreTaches) * 100) : 0;
  }

  // Méthodes de navigation
  evaluerStagiaire(stagiaire: any): void {
    this.router.navigate(['/evaluation/form', stagiaire.id]);
  }

  voirHistorique(stagiaire: any): void {
    this.router.navigate(['/evaluation/historique', stagiaire.id]);
  }

  navigateToEvaluation(stagiaireId: string): void {
    this.router.navigate(['/evaluation/form', stagiaireId]);
  }

  navigateToHistorique(stagiaireId: string): void {
    this.router.navigate(['/evaluation/historique', stagiaireId]);
  }

  refreshData(): void {
    this.refreshing = true;
    this.loadData();
    setTimeout(() => {
      this.refreshing = false;
    }, 1000);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getStagiaireName(stagiaireId: string): string {
    const stagiaire = this.stagiaires.find(s => s.id === stagiaireId);
    return stagiaire ? stagiaire.username : 'Stagiaire inconnu';
  }

  getStagiaireImage(stagiaireId: string): string {
    const stagiaire = this.stagiaires.find(s => s.id === stagiaireId);
    return stagiaire?.image || 'assets/images/user/avatar-1.jpg';
  }
}