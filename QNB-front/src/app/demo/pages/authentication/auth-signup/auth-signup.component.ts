import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [RouterModule, BrowserModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export default class AuthSignupComponent {
  signupForm: FormGroup;
  selectedFile: File | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  showPassword = false;
  showConfirmPassword = false;
  step = 1;
  successMessage = '';
  nextStep() {
    if (
      this.signupForm.get('firstName')?.valid &&
      this.signupForm.get('lastName')?.valid &&
      this.signupForm.get('username')?.valid &&
      this.signupForm.get('email')?.valid &&
      this.signupForm.get('phone')?.valid
    ) {
      this.step = 2;
    } else {
      // Marquer tous les champs de l'étape 1 comme touchés pour afficher les erreurs
      this.signupForm.get('firstName')?.markAsTouched();
      this.signupForm.get('lastName')?.markAsTouched();
      this.signupForm.get('username')?.markAsTouched();
      this.signupForm.get('email')?.markAsTouched();
      this.signupForm.get('phone')?.markAsTouched();
    }
  }

  prevStep() {
    this.step = 1;
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedImage = null;
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = new FormData();
      const userValue = { ...this.signupForm.value };
      delete userValue.confirmPassword;
      const userBlob = new Blob([JSON.stringify(userValue)], { type: 'application/json' });

      formData.append('user', userBlob);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.authService.signupWithImage(formData).subscribe(
        response => {
          this.successMessage = 'Compte créé avec succès ! Redirection...';
          setTimeout(() => {
            this.router.navigate(['auth/signin']);
          }, 1800);
        },
        error => {
          console.error('Error during signup', error);
        }
      );
    } else {
      console.warn('Formulaire invalide');
    }
  }
}
