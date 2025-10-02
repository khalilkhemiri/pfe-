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
      // username: alphanumeric + underscore, min 4
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email: ['', [Validators.required, Validators.email]],
      // phone: optional + start with + and 7-15 digits OR plain 7-15 digits
      phone: ['', [Validators.required, Validators.pattern('^\\+?\\d{7,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Helper getters for template
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get usernameF() { return this.signupForm.get('username'); }
  get emailF() { return this.signupForm.get('email'); }
  get phoneF() { return this.signupForm.get('phone'); }
  get passwordF() { return this.signupForm.get('password'); }
  get confirmPasswordF() { return this.signupForm.get('confirmPassword'); }

  isControlInvalid(controlName: string) {
    const c = this.signupForm.get(controlName);
    return c ? c.invalid && c.touched : false;
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
