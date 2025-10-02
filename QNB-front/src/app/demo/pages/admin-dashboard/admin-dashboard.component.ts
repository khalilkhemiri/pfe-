import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Modal de confirmation
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'approve' | 'reject' | 'delete' | 'status' | null = null;
  confirmTargetUser: any = null;
  confirmRole: string | null = null;

  // Profile modal state
  showProfileModal = false;
  profileUser: any = null;

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
            // Appliquer les filtres pour mettre à jour filteredUsers immédiatement
            this.applyUserFilters();
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

  openConfirm(type: 'approve' | 'reject' | 'delete' | 'status', user: any, role?: string) {
    this.confirmType = type;
    this.confirmTargetUser = user;
    this.confirmRole = role || null;
    if (type === 'approve') {
      this.confirmTitle = 'Confirmer la validation';
      this.confirmMessage = `Voulez-vous valider le compte de ${user.username || user.email} en tant que ${this.confirmRole || 'STAGIAIRE'} ?`;
    } else if (type === 'reject') {
      this.confirmTitle = 'Confirmer le rejet';
      this.confirmMessage = `Voulez-vous vraiment refuser/supprimer le compte de ${user.username || user.email} ?`;
    } else if (type === 'delete') {
      this.confirmTitle = 'Confirmer la suppression';
      this.confirmMessage = `Voulez-vous vraiment supprimer l'utilisateur ${user.username || user.email} ? Cette action est irréversible.`;
    } else if (type === 'status') {
      this.confirmTitle = 'Modifier le statut';
      this.confirmMessage = `Voulez-vous changer le statut de ${user.username || user.email} ?`;
    }
    this.showConfirmModal = true;
  }

  confirm(): void {
    if (!this.confirmType || !this.confirmTargetUser) {
      this.cancelConfirm();
      return;
    }

    const user = this.confirmTargetUser;
    const role = this.confirmRole || (user && user._selectedRole) || 'STAGIAIRE';

    if (this.confirmType === 'approve') {
      this.authService.assignRole(user.id, role).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log('Assign role response:', res);
          this.loadDashboardData();
          this.cancelConfirm();
        },
        error: (error) => {
          console.error('Erreur lors de la validation:', error);
          this.cancelConfirm();
        }
      });
    } else if (this.confirmType === 'reject') {
      this.authService.rejectUser(user.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          // Remove from pendingUsers locally to update UI immediately
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
          this.cancelConfirm();
        },
        error: (error) => {
          console.error('Erreur lors du rejet:', error);
          this.cancelConfirm();
        }
      });
    } else if (this.confirmType === 'delete') {
      // Call delete user endpoint
      this.authService.deleteUser(user.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          // Remove user from local lists immediately so UI updates without page refresh
          this.users = this.users.filter(u => u.id !== user.id);
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
          this.applyUserFilters();
          this.cancelConfirm();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.cancelConfirm();
        }
      });
    } else if (this.confirmType === 'status') {
      // Toggle status logic placeholder
      // Implement toggle API call here if available
      console.log('Toggle status for', user);
      this.cancelConfirm();
    }
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmType = null;
    this.confirmTargetUser = null;
    this.confirmRole = null;
  }

  // Actions utilisateurs
  onToggleUserStatus(user: any): void {
    this.openConfirm('status', user);
  }
  onRejectUser(user: any): void {
    this.openConfirm('reject', user);
  }

  onApproveUser(user: any): void {
    const role = user._selectedRole || 'STAGIAIRE';
    this.openConfirm('approve', user, role);
  }

  openProfile(user: any) {
    // Clone user to avoid editing table data directly until saved
    this.profileUser = { ...user };
    this.showProfileModal = true;
  }

  saveProfile() {
    if (!this.profileUser) return;
    // Optimistic local update: update users and pendingUsers lists
    this.users = this.users.map(u => u.id === this.profileUser.id ? { ...this.profileUser } : u);
    this.pendingUsers = this.pendingUsers.map(u => u.id === this.profileUser.id ? { ...this.profileUser } : u);
    this.applyUserFilters();
    this.showProfileModal = false;

    // TODO: call backend update API here when available, e.g. authService.updateUser(this.profileUser)
    console.log('Saved profile (local update):', this.profileUser);
  }

  cancelProfile() {
    this.profileUser = null;
    this.showProfileModal = false;
  }
}