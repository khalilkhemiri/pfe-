import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from "@schedule-x/angular";
import { createCalendar, createViewWeek, createViewMonthAgenda, createViewMonthGrid } from '@schedule-x/calendar';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<any[]>('http://localhost:8080/api/taches/stagiaire/67fe6e2ce170de1a3b628a4d')
      .subscribe((taches) => {
        const events = taches.map(tache => ({
          id: tache.id,
          title: tache.titre,
          start: tache.dateDebut.replace('""',''), 
          end: tache.dateFin.replace('""',''),
          backgroundColor: this.mapStatutToColor(tache.statut),
          description: tache.description || '',
          extendedProps: {
            statut: tache.statut
          }
        }));

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
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.calendarApp) {
      this.calendarApp.setTheme(this.isDarkMode ? 'dark' : 'light');
    }
  }

  showEventDetails(event: any): void {
    alert(`
      Titre: ${event.title}
      Statut: ${event.extendedProps.statut}
      Début: ${new Date(event.start).toLocaleString()}
      Fin: ${new Date(event.end).toLocaleString()}
      ${event.description ? `Description: ${event.description}` : ''}
    `);
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
