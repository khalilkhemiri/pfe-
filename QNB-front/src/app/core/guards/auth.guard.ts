import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Injectable({
  providedIn: 'root'  // 👈 Important pour que le guard soit bien injecté
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/auth/signin']);
    return false;
  }
}
