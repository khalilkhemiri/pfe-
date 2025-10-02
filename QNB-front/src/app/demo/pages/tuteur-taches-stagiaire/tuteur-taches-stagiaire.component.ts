import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tuteur-taches-stagiaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tuteur-taches-stagiaire.component.html',
  styleUrls: ['./tuteur-taches-stagiaire.component.scss']
})
export class TuteurTachesStagiaireComponent implements OnInit {
  @Input() stagiaireId!: string;
  taches: any[] = [];
  searchTerm = '';
  filterStatus = 'all';
  toastMsg = '';
  selectedTache: any = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.stagiaireId = params.get('stagiaireId')!;
      this.loadTaches();
    });
  }

  loadTaches() {
    this.http.get<any[]>(`http://localhost:8080/api/taches/stagiaire/${this.stagiaireId}`).subscribe({
      next: (data) => { this.taches = data; },
      error: () => { this.toastMsg = 'Erreur lors du chargement des tâches.'; }
    });
  }

  filteredTaches() {
    return this.taches.filter(t => {
      const matchSearch = t.titre.toLowerCase().includes(this.searchTerm.toLowerCase());
      let matchStatus = true;
      if (this.filterStatus === 'pending') matchStatus = t.rapportRendu && t.rapportRendu.valide === null;
      if (this.filterStatus === 'valid') matchStatus = t.rapportRendu && t.rapportRendu.valide === true;
      if (this.filterStatus === 'rejected') matchStatus = t.rapportRendu && t.rapportRendu.valide === false;
      return matchSearch && matchStatus;
    });
  }

  getCardClass(tache: any) {
    if (!tache.rapportRendu) return 'pending';
    if (tache.rapportRendu.valide === true) return 'valid';
    if (tache.rapportRendu.valide === false) return 'rejected';
    return 'pending';
  }
  getBadgeClass(tache: any) {
    if (!tache.rapportRendu) return 'badge pending';
    if (tache.rapportRendu.valide === true) return 'badge valid';
    if (tache.rapportRendu.valide === false) return 'badge rejected';
    return 'badge pending';
  }
  getStatusLabel(tache: any) {
    if (!tache.rapportRendu) return 'Non rendu';
    if (tache.rapportRendu.valide === true) return 'Validé';
    if (tache.rapportRendu.valide === false) return 'Rejeté';
    return 'En attente';
  }

  openSlideOver(tache: any) {
    this.selectedTache = tache;
  }

  closeSlideOver() {
    this.selectedTache = null;
  }

  validerRendu(tache: any = this.selectedTache) {
    const commentaire = tache.commentaireTuteur || '';
    this.http.put(`http://localhost:8080/api/taches/${tache.id}/rendu/valider`, {}, { params: { commentaire } }).subscribe({
      next: () => {
        tache.rapportRendu.valide = true;
        tache.rapportRendu.commentaireEncadrant = commentaire;
        this.toastMsg = 'Rendu validé !';
        this.closeSlideOver();
      },
      error: () => { this.toastMsg = 'Erreur lors de la validation.'; }
    });
  }
  rejeterRendu(tache: any = this.selectedTache) {
    const commentaire = tache.commentaireTuteur || '';
    this.http.put(`http://localhost:8080/api/taches/${tache.id}/rendu/rejeter`, {}, { params: { commentaire } }).subscribe({
      next: () => {
        tache.rapportRendu.valide = false;
        tache.rapportRendu.commentaireEncadrant = commentaire;
        this.toastMsg = 'Rendu rejeté.';
        this.closeSlideOver();
      },
      error: () => { this.toastMsg = 'Erreur lors du rejet.'; }
    });
  }

  isImage(url: string): boolean {
    return url ? url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null : false;
  }

  isImageFile(url: string | undefined): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png)$/i.test(url);
  }
}
