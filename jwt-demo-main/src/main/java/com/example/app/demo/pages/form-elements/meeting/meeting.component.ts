import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, Stagiaire } from '../../../service/auth/auth.service';
declare var ZegoUIKitPrebuilt: any;

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class MeetingComponent implements OnInit {
 meetingForm: FormGroup;
  stagiaires: Stagiaire[] = [];
  loading = false;
  successMsg = '';
  errorMsg = '';
  submitted = false;

  // Getter to return the currently selected stagiaire object (used by template)
  get selectedStagiaire(): Stagiaire | null {
    const id = this.meetingForm?.value?.stagiaireId;
    if (!id || !this.stagiaires) return null;
    return this.stagiaires.find(s => s.id === id) || null;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
      stagiaireId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const tuteurId = this.authService.getCurrentUserId();
    if (tuteurId) {
      this.authService.getStagiairesByTuteur(tuteurId).subscribe({
        next: (stagiaires) => (this.stagiaires = stagiaires || []),
        error: () => (this.errorMsg = 'Erreur lors du chargement des stagiaires.')
      });
    }
  }

  // convenience getter for template
  get f() { return this.meetingForm.controls; }

  resetForm() {
    this.meetingForm.reset();
    this.submitted = false;
    this.successMsg = '';
    this.errorMsg = '';
  }

  createMeeting(): void {
    if (this.meetingForm.invalid) return;

    this.loading = true;
    const roomID = Math.floor(Math.random() * 1000000).toString(); // ID de salle Jitsi

    // Lien d'invitation Jitsi
    const meetingLink = `${window.location.origin}/meeting/${roomID}`;
    console.log('Lien de la réunion Jitsi :', meetingLink);

    // Préparer les données à envoyer au backend
    const meetingData = {
      ...this.meetingForm.value,
      roomID: roomID,
      link: meetingLink
    };

    // Envoyer au backend pour sauvegarde et notification
    this.authService.createMeeting(meetingData).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Réunion créée et invitation envoyée !';
        this.meetingForm.reset();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Erreur lors de la création de la réunion.';
      }
    });
  }
}