import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Stagiaire } from '../../service/auth/auth.service';

@Component({
  selector: 'app-stagiaires-tuteur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stagiaires-tuteur.component.html',
  styleUrl: './stagiaires-tuteur.component.scss'
})
export class StagiairesTuteurComponent implements OnInit {
  stagiaires: Stagiaire[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math; // Pour utiliser Math dans le template

  constructor(private stagiaireService: AuthService) {}

  ngOnInit() {
    // TODO: Récupérer l'ID du tuteur depuis le service d'authentification
    const tuteurId = '67fe612de3c8970cb882f1e3'; // À remplacer par l'ID réel du tuteur connecté
    this.loadStagiaires(tuteurId);
  }

  loadStagiaires(tuteurId: string) {
    this.stagiaireService.getStagiairesByTuteur(tuteurId).subscribe({
      next: (data) => {
        this.stagiaires = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stagiaires:', error);
      }
    });
  }

  get paginatedStagiaires() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.stagiaires.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.stagiaires.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getActiveStagiairesCount(): number {
    return this.stagiaires.filter(s => s.active).length;
  }

  getInactiveStagiairesCount(): number {
    return this.stagiaires.filter(s => !s.active).length;
  }

  getAvatarStyle(stagiaire: Stagiaire): string {
    return stagiaire.image ? `url(${stagiaire.image})` : 'none';
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.stagiaires.length);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
