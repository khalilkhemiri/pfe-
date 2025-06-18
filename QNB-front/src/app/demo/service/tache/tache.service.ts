import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:8080/api/taches';

  constructor(private http: HttpClient) {}

  assignTache(tache: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, tache);
  }

  getTachesDuStagiaire(stagiaireId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stagiaire/${stagiaireId}`);
  }

  envoyerRendu(tacheId: string, formData: FormData) {
    return this.http.post(`${this.apiUrl}/${tacheId}/rendu`, formData);
  }
}
