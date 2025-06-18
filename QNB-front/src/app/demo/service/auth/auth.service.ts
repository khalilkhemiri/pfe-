import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

export interface Stagiaire {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  active: boolean;
  createdAt: string;
  tuteurId: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/signup';  // Remplace par ton URL d'API
  private apiUrl1 = 'http://localhost:8080/api/auth';  // Remplace par ton URL d'API

  constructor(private http: HttpClient,private router: Router) { }

  
  signupWithImage(formData: FormData) {
    return this.http.post('http://localhost:8080/api/auth/signup', formData, { responseType: 'text' });
  }
  
  
  login(username: string, password: string) {
    return this.http.post(this.apiUrl1 + '/signin', { username, password },
      { responseType: 'json' }
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/signin']);
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  getUserRole() {
    const token = this.getToken();
    if (!token) return null;
  
    const decoded: any = this.parseJwt(token);
    console.log(decoded); // ← ici tu as les rôles, username, etc.
    return decoded?.roles || null; // ← ici tu peux retourner le rôle
  }
  
  parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Erreur lors du décodage du token :', e);
      return null;
    }
  }
  
  getPendingUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl1}/pending`);
  }

  approveUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl1}/validate/${id}`, {});
  }

  rejectUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl1}/reject/${id}`,{ responseType: 'text' });
  }
  getStagiairesByTuteur(tuteurId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stagiaires-by-tuteur/${tuteurId}`);
  }

  getStagiaireById(id: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/auth/stagiaire/${id}`);
  }
}
