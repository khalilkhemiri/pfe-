import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        if (response.token) {
          // C'est bien le token
          this.authService.setToken(response.token);
          this.router.navigate(['/dash']);

        } else {
          // Cas où on aurait un message d'erreur renvoyé sous forme de texte
          this.errorMessage = response;
        }
      },
      error: (err) => {
        this.errorMessage = 'Identifiants incorrects ou problème serveur';
        console.error(err);
      }
    });
  }
  
}
