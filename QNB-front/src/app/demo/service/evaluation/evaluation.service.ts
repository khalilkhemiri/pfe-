import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evaluation {
  id?: string;
  stagiaireId: string;
  tuteurId: string;
  dateEvaluation: string;
  criteres: CritereEvaluation[];
  moyenneGlobale: number;
  statut: string;
  commentaire: string;
  recommandations?: string;
}

export interface CritereEvaluation {
  critereId: string;
  note: number;
  poids: number;
}

export interface EvaluationHistorique {
  id: string;
  dateEvaluation: string;
  moyenneGlobale: number;
  statut: string;
  commentaire: string;
  criteres: CritereEvaluation[];
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8080/api/evaluations';

  constructor(private http: HttpClient) { }

  // Créer une nouvelle évaluation
  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.apiUrl}/create`, evaluation);
  }

  // Créer une évaluation avec critères par défaut
  createEvaluationWithDefaultCriteres(evaluationData: any): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.apiUrl}/create-with-default-criteres`, evaluationData);
  }

  // Obtenir toutes les évaluations d'un stagiaire
  getEvaluationsByStagiaire(stagiaireId: string): Observable<EvaluationHistorique[]> {
    return this.http.get<EvaluationHistorique[]>(`${this.apiUrl}/stagiaire/${stagiaireId}`);
  }

  // Obtenir toutes les évaluations d'un tuteur
  getEvaluationsByTuteur(tuteurId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/tuteur/${tuteurId}`);
  }

  // Obtenir une évaluation spécifique
  getEvaluationById(evaluationId: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${evaluationId}`);
  }

  // Mettre à jour une évaluation
  updateEvaluation(evaluationId: string, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${evaluationId}`, evaluation);
  }

  // Supprimer une évaluation
  deleteEvaluation(evaluationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${evaluationId}`);
  }

  // Obtenir les statistiques d'évaluation d'un stagiaire
  getStagiaireStats(stagiaireId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/stagiaire/${stagiaireId}`);
  }

  // Obtenir les statistiques d'évaluation d'un tuteur
  getTuteurStats(tuteurId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/tuteur/${tuteurId}`);
  }

  // Exporter les évaluations en PDF
  exportEvaluationsPDF(tuteurId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf/${tuteurId}`, { responseType: 'blob' });
  }

  // Exporter les évaluations en Excel
  exportEvaluationsExcel(tuteurId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel/${tuteurId}`, { responseType: 'blob' });
  }

  // Obtenir les critères d'évaluation disponibles
  getCriteresEvaluation(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/criteres`);
  }

  // Calculer la moyenne pondérée
  calculerMoyennePonderee(criteres: CritereEvaluation[]): number {
    if (!criteres || criteres.length === 0) return 0;
    
    let totalPondere = 0;
    let totalPoids = 0;
    
    criteres.forEach(critere => {
      totalPondere += critere.note * critere.poids;
      totalPoids += critere.poids;
    });
    
    return totalPoids > 0 ? Math.round((totalPondere / totalPoids) * 10) / 10 : 0;
  }

  // Déterminer le statut basé sur la moyenne
  determinerStatut(moyenne: number): string {
    if (moyenne >= 9.0) return 'excellent';
    if (moyenne >= 7.5) return 'bon';
    if (moyenne >= 6.0) return 'moyen';
    return 'insuffisant';
  }

  // Obtenir la couleur du statut
  getStatutColor(statut: string): string {
    switch (statut) {
      case 'excellent': return '#4caf50';
      case 'bon': return '#2196f3';
      case 'moyen': return '#ff9800';
      case 'insuffisant': return '#f44336';
      default: return '#757575';
    }
  }

  // Obtenir l'icône du statut
  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'excellent': return 'star';
      case 'bon': return 'thumb_up';
      case 'moyen': return 'trending_up';
      case 'insuffisant': return 'warning';
      default: return 'help';
    }
  }
} 