import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // si nécessaire
import { FormsModule } from '@angular/forms';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { TacheService } from 'src/app/demo/service/tache/tache.service';
import { AuthService } from 'src/app/demo/service/auth/auth.service';

@Component({
  selector: 'app-basic-elements',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    FormsModule,
    NgxMatTimepickerModule
  ],
  templateUrl: './basic-elements.component.html',
  styleUrls: ['./basic-elements.component.scss']
})
export default class BasicElementsComponent {
  tacheForm!: FormGroup;
  statuts = ['EN_ATTENTE', 'EN_COURS', 'TERMINEE'];
  stagiaires: any[] = [];

  constructor(private fb: FormBuilder,    private tacheService: TacheService,    private stagiaireService: AuthService

  ) {}

  ngOnInit(): void {
    this.tacheForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      dateDebut: ['', Validators.required],
      heureDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureFin: ['', Validators.required],
      statut: ['EN_ATTENTE', Validators.required],
      stagiairesIds: []

    });
    this.stagiaireService.getStagiairesByTuteur('67fe612de3c8970cb882f1e3').subscribe((stagiaires) => {
      this.stagiaires = stagiaires;
    });
  }
  onSubmit() {
    if (this.tacheForm.valid) {
      const { dateDebut, heureDebut, dateFin, heureFin, ...rest } = this.tacheForm.value;
  
      // Vérifier que les dates et heures sont valides
      const dateTimeDebut = this.combineDateTime(dateDebut, heureDebut);
      const dateTimeFin = this.combineDateTime(dateFin, heureFin);
  
      if (!dateTimeDebut || !dateTimeFin) {
        alert('❌ Veuillez vérifier les dates et heures.');
        return;
      }
  
      const tachePayload = {
        ...rest,
        dateDebut: dateTimeDebut,
        dateFin: dateTimeFin
      };
  
      this.tacheService.assignTache(tachePayload).subscribe({
        next: res => {
          console.log('Tâche assignée avec succès', res);
          alert('✅ Tâche assignée avec succès !');
          this.tacheForm.reset();
        },
        error: err => {
          console.error('Erreur lors de l\'envoi de la tâche', err);
          alert('❌ Une erreur est survenue lors de l\'envoi de la tâche.');
        }
      });
    }
  }
  convertTo24HourFormat(time: string): string {
    const [hourMinute, period] = time.split(' '); // sépare l'heure et le période AM/PM
    const [hour, minute] = hourMinute.split(':');
  
    let hour24 = parseInt(hour, 10);
  
    if (period === 'AM') {
      if (hour24 === 12) {
        hour24 = 0; // 12 AM devient 00
      }
    } else if (period === 'PM') {
      if (hour24 !== 12) {
        hour24 += 12; // 1 PM à 11 PM devient entre 13 et 23
      }
    }
  
    // Formater les heures et minutes en 2 chiffres si nécessaire
    const formattedHour = hour24.toString().padStart(2, '0');
    return `${formattedHour}:${minute}`;
  }
  

  combineDateTime(date: string | Date, time: string): string {
    // Vérification que la date est valide
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error('Date invalide:', date);
      return '';
    }
  
    // Convertir l'heure au format 24 heures
    const time24 = this.convertTo24HourFormat(time);
    const [hours, minutes] = time24.split(':');
    if (!hours || !minutes || isNaN(+hours) || isNaN(+minutes)) {
      console.error('Heure invalide:', time);
      return '';
    }
  
    // Appliquer l'heure à la date
    d.setHours(+hours);
    d.setMinutes(+minutes);
    return d.toISOString().slice(0, 16).replace('T', ' '); // Format: yyyy-MM-dd HH:mm
  }
  
  
}
