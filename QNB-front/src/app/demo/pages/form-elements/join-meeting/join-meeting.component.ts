import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth/auth.service';

@Component({
  selector: 'app-meeting-join',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class JoinMeetingComponent implements OnInit, AfterViewInit {

  @ViewChild('jitsiContainer', { static: false }) jitsiContainer?: ElementRef<HTMLDivElement>;

  roomIDParam: string | null = null;
  isEmbedding = false;
  meetings: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    // subscribe to route params so we always get the real value (not a literal ":roomID")
    this.route.paramMap.subscribe(params => {
      const raw = params.get('roomID');
      if (raw) {
        // sanitize in case a literal ":roomID" was used somewhere
        this.roomIDParam = String(raw).replace(/^:/, '');
        this.isEmbedding = true;
      }
    });

    // If no room param, load meetings for tutor
    if (!this.route.snapshot.paramMap.get('roomID')) {
      this.loadTutorMeetings();
    }
  }

  ngAfterViewInit() {
    // embed only after the view is initialised and the container exists
    if (this.roomIDParam) {
      // small delay to ensure external_api.js (if added dynamically) had time to load
      setTimeout(() => this.embedJitsi(this.roomIDParam as string), 50);
    }
  }

  loadTutorMeetings() {
    this.loading = true;
    this.errorMessage = '';
    const tutorId = this.auth.getCurrentUserId();
    if (!tutorId) {
      this.errorMessage = 'Impossible de récupérer l\'identifiant du tuteur.';
      this.loading = false;
      return;
    }

    const url = `http://192.168.136.130:31615/api/meetings/tuteur/${tutorId}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.meetings = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur en chargeant les réunions du tuteur', err);
        this.errorMessage = 'Impossible de charger vos réunions. Vérifiez la connexion ou contactez l\'administrateur.';
        this.loading = false;
      }
    });
  }

  // Open meeting page (route that embeds Jitsi)
  joinInApp(meeting: any) {
    const room = meeting.roomID || meeting.roomId || meeting.id || '';
    if (!room) return;
    this.router.navigate(['/meeting', room]);
  }

  // Open external link in new tab (if backend provided a full link)
  openExternal(meeting: any) {
    const link = meeting.link || meeting.meetingLink || meeting.url || `${window.location.origin}/meeting/${meeting.roomID}`;
    if (link) window.open(link, '_blank');
  }

  copyLink(meeting: any) {
    const link = meeting.link || meeting.meetingLink || `${window.location.origin}/meeting/${meeting.roomID}`;
    if (!link) return;
    navigator.clipboard?.writeText(link).then(() => {
      console.log('Lien copié');
    }).catch(err => console.error('Impossible de copier le lien', err));
  }

  // Embeds Jitsi for a given roomID (same as previous implementation)
  embedJitsi(roomID: string) {
    if (!this.jitsiContainer) {
      console.error('Le container Jitsi n\'est pas disponible');
      this.errorMessage = 'Impossible de trouver le container de réunion.';
      return;
    }

    // defensive: trim and sanitize
    const room = String(roomID).trim().replace(/^:/, '');

    // Verify external API is loaded
    if (!(window as any).JitsiMeetExternalAPI) {
      console.error('JitsiMeetExternalAPI non trouvé. Assurez-vous d\'avoir importé https://meet.jit.si/external_api.js dans index.html');
      this.errorMessage = 'Module de réunion non chargé. Contactez l\'administrateur.';
      return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName: room,
      parentNode: this.jitsiContainer.nativeElement,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: 'User_' + Math.floor(Math.random() * 10000)
      }
    };

    try {
      // @ts-ignore
      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      api.addEventListener('videoConferenceJoined', () => console.log('Joined the meeting:', room));
    } catch (err) {
      console.error('Erreur embedding Jitsi:', err);
      this.errorMessage = 'Impossible de charger le module de réunion (Jitsi).';
    }
  }

}