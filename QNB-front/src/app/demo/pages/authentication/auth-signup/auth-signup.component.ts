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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.signupForm.valid && this.selectedFile) {
      const formData = new FormData();
      const userBlob = new Blob([JSON.stringify(this.signupForm.value)], { type: 'application/json' });

      formData.append('user', userBlob);
      formData.append('image', this.selectedFile);

      this.authService.signupWithImage(formData).subscribe(
        response => {
          this.router.navigate(['auth/signin']);
        },
        error => {
          console.error('Error during signup', error);
        }
      );
    } else {
      console.warn('Form invalid or no image selected');
    }
  }
}
