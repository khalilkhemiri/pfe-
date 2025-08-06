import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ...existing code...
// import { AdminDashboardService, DashboardStats, UserStats } from '../../service/admin-dashboard/admin-dashboard.service';
import { AuthService, Stagiaire } from '../../service/auth/auth.service';
// import { TacheService } from '../../service/tache/tache.service';
// import { EvaluationService } from '../../service/evaluation/evaluation.service';
import { Subject, takeUntil, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  // ...existing code...
  private destroy$ = new Subject<void>();

  // Statistiques principales (à adapter si besoin)
  stats = {
    totalUsers: 0,
    totalStagiaires: 0,
    totalTuteurs: 0,
    totalAdmins: 0
  };

  // Utilisateurs et pending
  users: any[] = []; // TODO: remplacer par tous les users si API dispo
  filteredUsers: any[] = [];
  pendingUsers: any[] = [];
  searchTerm: string = '';
  filterRole: string = 'all';

  loading = true;
  error = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;

    // Charger les pending users
    this.authService.getPendingUsers().pipe(catchError(() => of([]))).subscribe({
      next: (pending) => {
        this.pendingUsers = pending || [];
      }
    });

    // Charger tous les stagiaires
    this.authService.getAllStagiaires().pipe(catchError(() => of([]))).subscribe({
      next: (stagiaires) => {
        // Charger tous les tuteurs
        this.authService.getAllTuteurs().pipe(catchError(() => of([]))).subscribe({
          next: (tuteurs) => {
            // Fusionner stagiaires et tuteurs pour le tableau principal
            this.users = [...(stagiaires || []), ...(tuteurs || [])];
            this.stats.totalStagiaires = stagiaires.length;
            this.stats.totalTuteurs = tuteurs.length;
            this.stats.totalUsers = stagiaires.length + tuteurs.length;
            this.loading = false;
          },
          error: () => {
            this.error = true;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.applyUserFilters();
  }
  onRoleFilterChange(role: string): void {
    this.filterRole = role;
    this.applyUserFilters();
  }
  applyUserFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = this.filterRole === 'all' || user.role?.toLowerCase() === this.filterRole;
      const matchesSearch =
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }

  // Actions utilisateurs
  onToggleUserStatus(user: any): void {
    // À implémenter si une méthode existe dans AuthService
  }
  onRejectUser(user: any): void {
    this.authService.rejectUser(user.id)
      .subscribe({
        next: () => this.loadDashboardData(),
        error: (error) => console.error('Erreur lors du rejet:', error)
      });
  }

  onApproveUser(user: any): void {
    this.authService.approveUser(user.id)
      .subscribe({
        next: () => this.loadDashboardData(),
        error: (error) => console.error('Erreur lors de la validation:', error)
      });
  }
}