// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { TacheService } from '../service/tache/tache.service';

interface UrgentTask {
  id: string;
  titre: string;
  stagiaireName: string;
  dateFin: Date;
  daysLeft: number;
}

interface NewMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  time: Date;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stagiaires: any[] = [];
  currentTuteur: any = null;
  stats = {
    totalStagiaires: 0,
    stagiairesActifs: 0,
    tachesEnCours: 0,
    tachesTerminees: 0
  };
  urgentTasks: UrgentTask[] = [];
  newMessages: NewMessage[] = [];

  constructor(
    private userService: AuthService,
    private tacheService: TacheService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCurrentTuteur();
    // Charger les tâches urgentes et messages toutes les 30 secondes
    this.loadUrgentTasks();
    setInterval(() => {
      this.loadUrgentTasks();
    }, 30000);
  }

  loadCurrentTuteur() {
    // For testing without token, we'll use a mock tuteur
    this.currentTuteur = {
      id: '67fe612de3c8970cb882f1e3', // Mock tuteur ID
      username: 'Test Tuteur'
    };
    console.log('Current tuteur set:', this.currentTuteur);
    this.loadStagiaires();
  }

  loadStagiaires() {
    if (this.currentTuteur) {
      console.log('Loading stagiaires for tuteur:', this.currentTuteur.id);
      this.userService.getStagiairesByTuteur(this.currentTuteur.id).subscribe({
        next: (stagiaires) => {
          console.log('Stagiaires loaded:', stagiaires);
          this.stagiaires = stagiaires;
          // Load tasks for each stagiaire
          this.loadTasksForStagiaires();
        },
        error: (error) => {
          console.error('Error loading stagiaires:', error);
        }
      });
    }
  }

  loadTasksForStagiaires() {
    let totalTachesEnCours = 0;
    let totalTachesTerminees = 0;
    let processedStagiaires = 0;

    this.stagiaires.forEach(stagiaire => {
      this.http.get<any[]>(`http://192.168.136.130:31615/api/taches/stagiaire/${stagiaire.id}`).subscribe({
        next: (taches) => {
          console.log(`Tasks for stagiaire ${stagiaire.id}:`, taches);
          
          // Calculate tasks for this stagiaire
          const tachesEnCours = taches.filter(t => t.statut === 'EN_COURS').length;
          const tachesTerminees = taches.filter(t => t.statut === 'TERMINEE').length;
          
          // Update stagiaire object
          stagiaire.tachesEnCours = tachesEnCours;
          stagiaire.tachesTerminees = tachesTerminees;
          
          // Update totals
          totalTachesEnCours += tachesEnCours;
          totalTachesTerminees += tachesTerminees;
          
          processedStagiaires++;
          
          // When all stagiaires are processed, update stats
          if (processedStagiaires === this.stagiaires.length) {
            this.stats.tachesEnCours = totalTachesEnCours;
            this.stats.tachesTerminees = totalTachesTerminees;
            this.calculateStats();
            this.updateStats();
          }
        },
        error: (error) => {
          console.error(`Error loading tasks for stagiaire ${stagiaire.id}:`, error);
          processedStagiaires++;
          
          // Still update stats even if there's an error
          if (processedStagiaires === this.stagiaires.length) {
            this.calculateStats();
            this.updateStats();
          }
        }
      });
    });
  }

  calculateStats() {
    console.log('Calculating stats for stagiaires:', this.stagiaires);
    this.stats = {
      totalStagiaires: this.stagiaires.length,
      stagiairesActifs: this.stagiaires.filter(s => s.active).length,
      tachesEnCours: this.stagiaires.reduce((acc, s) => acc + (s.tachesEnCours || 0), 0),
      tachesTerminees: this.stagiaires.reduce((acc, s) => acc + (s.tachesTerminees || 0), 0)
    };
    console.log('Stats calculated:', this.stats);
  }

  navigateToChat(stagiaireId: string) {
    this.router.navigate(['/chat'], { queryParams: { stagiaireId } });
  }

  navigateToTaches(stagiaireId: string) {
    this.router.navigate(['/tuteur/taches-stagiaire', stagiaireId]);
  }

  // Statistiques pour les cartes
  statsCards = [
    {
      title: 'Total Stagiaires',
      icon: 'icon-users text-c-blue',
      amount: '0',
      percentage: '100%',
      progress: 100,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme'
    },
    {
      title: 'Stagiaires Actifs',
      icon: 'icon-user-check text-c-green',
      amount: '0',
      percentage: '0%',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme2'
    },
    {
      title: 'Tâches en Cours',
      icon: 'icon-clock text-c-yellow',
      amount: '0',
      percentage: '0%',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme3'
    },
    {
      title: 'Tâches Terminées',
      icon: 'icon-check-circle text-c-green',
      amount: '0',
      percentage: '0%',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme4'
    }
  ];

  // Mise à jour des statistiques
  updateStats() {
    this.statsCards[0].amount = this.stats.totalStagiaires.toString();
    this.statsCards[1].amount = this.stats.stagiairesActifs.toString();
    this.statsCards[2].amount = this.stats.tachesEnCours.toString();
    this.statsCards[3].amount = this.stats.tachesTerminees.toString();

    // Calcul des pourcentages
    if (this.stats.totalStagiaires > 0) {
      this.statsCards[1].percentage = Math.round((this.stats.stagiairesActifs / this.stats.totalStagiaires) * 100) + '%';
      this.statsCards[1].progress = (this.stats.stagiairesActifs / this.stats.totalStagiaires) * 100;
    }

    const totalTaches = this.stats.tachesEnCours + this.stats.tachesTerminees;
    if (totalTaches > 0) {
      this.statsCards[2].percentage = Math.round((this.stats.tachesEnCours / totalTaches) * 100) + '%';
      this.statsCards[2].progress = (this.stats.tachesEnCours / totalTaches) * 100;
      
      this.statsCards[3].percentage = Math.round((this.stats.tachesTerminees / totalTaches) * 100) + '%';
      this.statsCards[3].progress = (this.stats.tachesTerminees / totalTaches) * 100;
    }
  }

  // public method
  

  

  loadUrgentTasks() {
    this.stagiaires.forEach(stagiaire => {
      this.http.get<any[]>(`http://192.168.136.130:31615/api/taches/stagiaire/${stagiaire.id}`).subscribe({
        next: (taches) => {
          const urgentTaches = taches
            .filter(tache => {
              const deadline = new Date(tache.dateFin);
              const now = new Date();
              const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return daysLeft <= 3 && tache.statut !== 'TERMINEE';
            })
            .map(tache => ({
              id: tache.id,
              titre: tache.titre,
              stagiaireName: stagiaire.username,
              dateFin: new Date(tache.dateFin),
              daysLeft: Math.ceil((new Date(tache.dateFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            }));

          this.urgentTasks = [...this.urgentTasks, ...urgentTaches]
            .sort((a, b) => a.daysLeft - b.daysLeft);
        },
        error: (error) => {
          console.error(`Error loading urgent tasks for stagiaire ${stagiaire.id}:`, error);
        }
      });
    });
  }

  
}
