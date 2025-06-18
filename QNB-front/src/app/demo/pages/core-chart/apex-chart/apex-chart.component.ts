import { Component, viewChild } from '@angular/core';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import {  OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
// third party
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-apex-chart',
  standalone: true,
  imports: [SharedModule,DragDropModule],
  templateUrl: './apex-chart.component.html',
  styleUrls: ['./apex-chart.component.scss']
})
export default class ApexChartComponent implements OnInit {

  stagiaireId = '67fe6e2ce170de1a3b628a4d'; 

  statuts = [
    { label: 'En attente', value: 'EN_ATTENTE', tasks: [] },
    { label: 'En cours', value: 'EN_COURS', tasks: [] },
    { label: 'Terminée', value: 'TERMINEE', tasks: [] }
  ];

  get connectedDropLists() {
    return this.statuts.map(s => s.value);
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`http://localhost:8080/api/taches/stagiaire/${this.stagiaireId}`).subscribe(data => {
      data.forEach(task => {
        const column = this.statuts.find(s => s.value === task.statut);
        if (column) column.tasks.push(task);
      });
    });
  }

  onDrop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) return;

    const task = event.previousContainer.data[event.previousIndex];

    // Update local UI
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Update task status via API
    const updatedTask = { ...task, statut: newStatus };

    this.http.put(`http://localhost:8080/api/taches/${task.id}`, updatedTask).subscribe({
      next: () => console.log('Tâche mise à jour.'),
      error: err => console.error('Erreur lors de la mise à jour :', err)
    });
  }
  
}



