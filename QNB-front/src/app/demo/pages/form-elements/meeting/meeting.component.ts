import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, Stagiaire } from '../../../service/auth/auth.service';
declare var ZegoUIKitPrebuilt: any;

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class MeetingComponent implements OnInit, AfterViewInit {
  meetingForm: FormGroup;
  stagiaires: Stagiaire[] = [];
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
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
        next: (stagiaires) => this.stagiaires = stagiaires || [],
        error: () => this.errorMsg = 'Erreur lors du chargement des stagiaires.'
      });
    }
  }

  ngAfterViewInit(): void {
    function getUrlParams(url: string) {
      let urlStr = url.split('?')[1];
      const urlSearchParams = new URLSearchParams(urlStr);
      const params: any = {};
      urlSearchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }

    const roomID = getUrlParams(window.location.href)['roomID'] || (Math.floor(Math.random() * 10000) + "");
    const userID = Math.floor(Math.random() * 10000) + "";
    const userName = getUrlParams(window.location.href)['username'] || "userName" + userID;
    const appID = 1633619230;
    const serverSecret = "208a0651fc2a554b2ce6d690cacbe4ef";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: document.querySelector("#root"),
      sharedLinks: [{
        name: 'Personal link',
        url: window.location.protocol + '//' + window.location.host  + window.location.pathname + '?roomID=' + roomID,
      }],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      turnOnMicrophoneWhenJoining: false,
      turnOnCameraWhenJoining: false,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      maxUsers: 2,
      layout: "Auto",
      showLayoutButton: false,
    });
  }

  createMeeting(): void {
    if (this.meetingForm.invalid) return;
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    // Générer le lien de réunion comme dans ngAfterViewInit
    function getUrlParams(url: string) {
      let urlStr = url.split('?')[1];
      const urlSearchParams = new URLSearchParams(urlStr);
      const params: any = {};
      urlSearchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }
    const roomID = getUrlParams(window.location.href)['roomID'] || (Math.floor(Math.random() * 10000) + "");
    const meetingLink = window.location.protocol + '//' + window.location.host  + window.location.pathname + '?roomID=' + roomID;
    console.log('Lien de la réunion Zego:', meetingLink);

    // À remplacer par un appel à un vrai MeetingService si disponible
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'Réunion créée et invitation envoyée !';
      this.meetingForm.reset();
    }, 1000);
  }
}
