import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from "@schedule-x/angular";
import { createCalendar, createViewWeek, createViewMonthAgenda, createViewMonthGrid } from '@schedule-x/calendar';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'app-tbl-bootstrap',
  standalone: true,
  imports: [SharedModule, CalendarComponent],
  templateUrl: './tbl-bootstrap.component.html',
  styleUrls: ['./tbl-bootstrap.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class TblBootstrapComponent {
  calendarApp: any;
  isDarkMode: boolean = false;

  // Event modal state
  showEventModal = false;
  modalEvent: any = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    const stagiaireId = this.authService.getCurrentUserId();

    // 1. Récupérer les tâches
    this.http.get<any[]>(`http://192.168.136.130:31615/api/taches/stagiaire/${stagiaireId}`)
      .subscribe((taches) => {
        const taskEvents = taches.map(tache => ({
          id: `tache-${tache.id}`,
          title: `📌 ${tache.titre}`,
          start: tache.dateDebut.replace('""',''),
          end: tache.dateFin.replace('""',''),
          backgroundColor: this.mapStatutToColor(tache.statut),
          description: tache.description || '',
          extendedProps: {
            type: 'tache',
            statut: tache.statut
          }
        }));

        // 2. Récupérer les meetings
        this.http.get<any[]>(`http://192.168.136.130:31615/api/meetings/stagiaire/${stagiaireId}`)
          .subscribe((meetings) => {
            function toTaskFormat(dateString: string): string {
              const d = new Date(dateString);
              const pad = (n: number) => n.toString().padStart(2, '0');
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }

            const meetingEvents = meetings.map(meeting => {
              const link = this.extractMeetingLink(meeting);
              const start = toTaskFormat(meeting.date);
              const endDate = new Date(meeting.date);
              endDate.setHours(endDate.getHours() + 1); // +1h
              const end = toTaskFormat(endDate.toISOString());
              return {
                id: `meeting-${meeting.id}`,
                title: `📅 ${meeting.title || meeting.titre || 'Réunion'}`,
                start: start,
                end: end,
                backgroundColor: '#17a2b8',
                description: link ? `Lien: ${link}` : '',
                extendedProps: {
                  type: 'meeting',
                  link: link
                }
              };
            });
console.log('Raw meetings from backend:', meetings);
console.log('Meeting Events:', meetingEvents);
            // 3. Fusionner les deux
            const events = [...taskEvents, ...meetingEvents];

            // 4. Créer le calendrier
            this.calendarApp = createCalendar({
              events: events,
              views: [createViewMonthGrid(), createViewWeek(), createViewMonthAgenda()],
              defaultView: 'month',
              firstDayOfWeek: 1,
              theme: this.isDarkMode ? 'dark' : 'light',
              callbacks: {
                onEventClick: (event) => {
                  this.showEventDetails(event);
                }
              }
            });
          });
      });
  }

  // Helper to find meeting link from possible backend property names
  private extractMeetingLink(meeting: any): string | null {
    if (!meeting) return null;
    return meeting.meetingLink || meeting.link || meeting.url || meeting.meetingUrl || meeting.inviteLink || meeting.meeting_url || meeting.meetingURL || null;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.calendarApp) {
      this.calendarApp.setTheme(this.isDarkMode ? 'dark' : 'light');
    }
  }

  formatDateForDisplay(dateInput: string | Date): string {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    return d.toLocaleString();
  }

  showEventDetails(event: any): void {
    // Normalize event object (Schedule-X event wrappers can vary)
    const ev = event?.extendedProps ? event : event; // keep as-is
    this.modalEvent = {
      type: ev.extendedProps?.type || 'tache',
      title: ev.title || ev.name || 'Événement',
      description: ev.description || ev.extendedProps?.description || '',
      start: ev.start || ev.extendedProps?.start || null,
      end: ev.end || ev.extendedProps?.end || null,
      link: ev.extendedProps?.link || ev.extendedProps?.meetingLink || null,
      statut: ev.extendedProps?.statut || null,
    };

    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.modalEvent = null;
  }

  mapStatutToColor(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return '#ffa500';
      case 'EN_COURS': return '#007bff';
      case 'TERMINEE': return '#28a745';
      default: return '#6c757d';
    }
  }
}
