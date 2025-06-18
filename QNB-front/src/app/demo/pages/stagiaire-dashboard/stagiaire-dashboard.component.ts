import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TacheService } from '../../service/tache/tache.service';
import { AuthService } from '../../service/auth/auth.service';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

interface Tache {
  id: string;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  priorite: string;
  progression: number;
}

interface Progression {
  tachesEnCours: number;
  tachesTerminees: number;
  totalTaches: number;
  tauxCompletion: number;
}

interface Stagiaire {
  id: string;
  username: string;
  email: string;
  image?: string;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-stagiaire-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './stagiaire-dashboard.component.html',
  styleUrls: ['./stagiaire-dashboard.component.scss']
})
export class StagiaireDashboardComponent implements OnInit {
  stagiaireId: string = '';
  stagiaireInfo: Stagiaire | null = null;
  taches: Tache[] = [];
  progression: Progression = {
    tachesEnCours: 0,
    tachesTerminees: 0,
    totalTaches: 0,
    tauxCompletion: 0
  };
  tachesUrgentes: Tache[] = [];
  tachesEnCours: Tache[] = [];
  tachesTerminees: Tache[] = [];
  recentActivity: any[] = [];

  // Configuration des graphiques
  public progressionChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Terminées', 'En cours', 'Urgentes'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      hoverBackgroundColor: ['#218838', '#e0a800', '#c82333'],
      borderWidth: 0
    }]
  };

  public progressionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    },
    cutout: '70%'
  };

  public weeklyProgressData: ChartConfiguration<'line'>['data'] = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      label: 'Progression',
      fill: true,
      tension: 0.4,
      borderColor: '#4e73df',
      backgroundColor: 'rgba(78, 115, 223, 0.1)',
      pointBackgroundColor: '#4e73df',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  public weeklyProgressOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private tacheService: TacheService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStagiaireInfo();
  }

  loadStagiaireInfo() {
    this.stagiaireId = '684848c2723f2b2316deef13';
    console.log('Utilisation de l\'ID statique:', this.stagiaireId);

    this.authService.getStagiaireById(this.stagiaireId).subscribe({
      next: (stagiaire) => {
        this.stagiaireInfo = stagiaire;
        console.log('Informations du stagiaire chargées:', stagiaire);
        this.loadTaches();
        this.loadRecentActivity();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des informations du stagiaire:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
      }
    });
  }

  loadTaches() {
    console.log('Chargement des tâches pour le stagiaire:', this.stagiaireId);
    this.tacheService.getTachesDuStagiaire(this.stagiaireId).subscribe({
      next: (taches) => {
        console.log('Réponse brute des tâches:', taches);
        this.taches = taches.map(tache => ({
          ...tache,
          dateDebut: new Date(tache.dateDebut),
          dateFin: new Date(tache.dateFin)
        }));
        console.log('Tâches transformées:', this.taches);

        // Calculer les statistiques
        this.tachesEnCours = this.taches.filter(t => t.statut === 'EN_COURS');
        this.tachesTerminees = this.taches.filter(t => t.statut === 'TERMINEE');
        this.tachesUrgentes = this.taches.filter(t => {
          const deadline = new Date(t.dateFin);
          const now = new Date();
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 3 && t.statut !== 'TERMINEE';
        });

        // Mettre à jour les données du graphique de progression
        this.progressionChartData.datasets[0].data = [this.tachesTerminees.length, this.tachesEnCours.length, this.tachesUrgentes.length];

        // Mettre à jour la progression
        this.progression = {
          tachesEnCours: this.tachesEnCours.length,
          tachesTerminees: this.tachesTerminees.length,
          totalTaches: this.taches.length,
          tauxCompletion: this.taches.length > 0 
            ? (this.tachesTerminees.length / this.taches.length) * 100 
            : 0
        };
        console.log('Statistiques calculées:', {
          tachesEnCours: this.tachesEnCours.length,
          tachesTerminees: this.tachesTerminees.length,
          totalTaches: this.taches.length,
          tauxCompletion: this.progression.tauxCompletion
        });

        // Simuler des données de progression hebdomadaire
        this.weeklyProgressData.datasets[0].data = this.generateWeeklyProgress();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
      }
    });
  }

  private generateWeeklyProgress(): number[] {
    // Simuler des données de progression pour la semaine
    return Array.from({length: 7}, () => Math.floor(Math.random() * 100));
  }

  loadRecentActivity() {
    // Simuler des activités récentes
    this.recentActivity = [
      {
        type: 'TASK_COMPLETED',
        description: 'Tâche "Développement Frontend" terminée',
        date: new Date()
      },
      {
        type: 'TASK_STARTED',
        description: 'Nouvelle tâche "Tests Unitaires" assignée',
        date: new Date(Date.now() - 3600000)
      },
      {
        type: 'MESSAGE',
        description: 'Message reçu de votre tuteur',
        date: new Date(Date.now() - 7200000)
      }
    ];
  }

  getStatusClass(tache: Tache): string {
    switch (tache.statut) {
      case 'TERMINEE':
        return 'bg-success-subtle text-success';
      case 'EN_COURS':
        return 'bg-warning-subtle text-warning';
      default:
        return 'bg-info-subtle text-info';
    }
  }

  getPriorityClass(tache: Tache): string {
    switch (tache.priorite) {
      case 'HAUTE':
        return 'bg-danger-subtle text-danger';
      case 'MOYENNE':
        return 'bg-warning-subtle text-warning';
      default:
        return 'bg-info-subtle text-info';
    }
  }

  isUrgent(tache: Tache): boolean {
    const deadline = new Date(tache.dateFin);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && tache.statut !== 'TERMINEE';
  }

  hasUrgentTasks(): boolean {
    return this.taches.some(tache => this.isUrgent(tache));
  }

  getUpcomingTasks(): Tache[] {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.taches
      .filter(tache => {
        const deadline = new Date(tache.dateFin);
        return deadline >= now && 
               deadline <= sevenDaysLater && 
               tache.statut !== 'TERMINEE';
      })
      .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime());
  }

  hasUpcomingTasks(): boolean {
    return this.getUpcomingTasks().length > 0;
  }

  getDateRange(): string {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return `${now.toLocaleDateString()} - ${sevenDaysLater.toLocaleDateString()}`;
  }

  navigateToTacheDetail(tacheId: string) {
    this.router.navigate(['/tache', tacheId]);
  }

  navigateToChat() {
    this.router.navigate(['/chat']);
  }
} 