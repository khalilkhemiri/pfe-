import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form?: NgForm) {
    console.log('onSubmit called', { username: this.username, passwordPresent: !!this.password });
    this.errorMessage = '';

    if (form && form.invalid) {
      console.warn('Login form invalid', form);
      // mark all fields touched so validation UI appears
      Object.values(form.controls || {}).forEach((c: any) => c.markAsTouched && c.markAsTouched());
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        console.log('login response', response);
        if (response && response.token) {
          this.authService.setToken(response.token);
          // Navigate to dashboard (adjust route if needed)
          this.router.navigate(['/dashboard']);
        } else if (typeof response === 'string') {
          this.errorMessage = response;
        } else {
          this.errorMessage = 'Réponse inattendue du serveur.';
        }
      },
      error: (err) => {
        console.error('login error', err);
        // Try to extract meaningful message
        if (err?.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err?.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Identifiants incorrects ou problème serveur';
        }
      }
    });
  }
  
}
