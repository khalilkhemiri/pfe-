import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from '../../service/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export default class SamplePageComponent {
  stagiaires: any[] = [];
  constructor(private stagiaireService: AuthService, private router: Router) {}

  ngOnInit() {
    this.getStagiairesParTuteur();
  }
  
  getStagiairesParTuteur() {
    const tuteurId ='67fe612de3c8970cb882f1e3'; 
    this.stagiaireService.getStagiairesByTuteur(tuteurId).subscribe({
      next: data => this.stagiaires = data,
      error: err => console.error('Erreur de récupération des stagiaires', err)
    });
  }

}
