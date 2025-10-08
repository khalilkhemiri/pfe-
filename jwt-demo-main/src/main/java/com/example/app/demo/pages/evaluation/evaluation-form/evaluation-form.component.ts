import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../service/auth/auth.service';
import { EvaluationService } from '../../../service/evaluation/evaluation.service';

export interface CritereEvaluation {
  id: string;
  nom: string;
  description: string;
  icone: string;
  poids: number;
}

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.scss']
})
export class EvaluationFormComponent implements OnInit, OnDestroy {
  evaluationForm!: FormGroup;
  stagiaire: any;
  criteres: CritereEvaluation[] = [];
  loading = false;
  submitting = false;
  formReady = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private evaluationService: EvaluationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeCriteres();
    this.initializeForm();
    this.loadStagiaire();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCriteres(): void {
    this.criteres = [
      {
        id: 'competences_techniques',
        nom: 'Compétences Techniques',
        description: 'Maîtrise des technologies et outils utilisés',
        icone: 'code',
        poids: 25
      },
      {
        id: 'qualite_travail',
        nom: 'Qualité du Travail',
        description: 'Précision, rigueur et attention aux détails',
        icone: 'verified',
        poids: 25
      },
      {
        id: 'respect_delais',
        nom: 'Respect des Délais',
        description: 'Ponctualité et respect des échéances',
        icone: 'schedule',
        poids: 20
      },
      {
        id: 'communication',
        nom: 'Communication',
        description: 'Clarté dans les échanges et le reporting',
        icone: 'chat',
        poids: 15
      },
      {
        id: 'autonomie',
        nom: 'Autonomie',
        description: 'Capacité à travailler de manière indépendante',
        icone: 'person',
        poids: 15
      }
    ];
  }

  private initializeForm(): void {
    const formControls: any = {};
    
    // Ajouter les contrôles pour chaque critère
    this.criteres.forEach(critere => {
      formControls[critere.id] = [5, [Validators.required, Validators.min(1), Validators.max(10)]];
    });

    // Ajouter les autres contrôles
    formControls.commentaire = ['', Validators.required];
    formControls.recommandations = [''];

    this.evaluationForm = this.fb.group(formControls);
    this.formReady = true;
  }

  loadStagiaire(): void {
    const stagiaireId = this.route.snapshot.paramMap.get('id');
    if (stagiaireId) {
      this.loading = true;
      this.authService.getStagiaireById(stagiaireId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stagiaire) => {
            this.stagiaire = stagiaire;
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors du chargement du stagiaire:', error);
            this.loading = false;
            this.snackBar.open('Erreur lors du chargement du stagiaire', 'Fermer', {
              duration: 3000
            });
          }
        });
    }
  }

  getMoyenneGlobale(): number {
    if (!this.formReady) return 0;
    
    let total = 0;
    let poidsTotal = 0;

    this.criteres.forEach(critere => {
      const valeur = this.evaluationForm.get(critere.id)?.value || 0;
      total += valeur * critere.poids;
      poidsTotal += critere.poids;
    });

    return poidsTotal > 0 ? Math.round((total / poidsTotal) * 10) / 10 : 0;
  }

  getStatut(moyenne: number): string {
    if (moyenne >= 9.0) return 'excellent';
    if (moyenne >= 7.5) return 'bon';
    if (moyenne >= 6.0) return 'moyen';
    return 'insuffisant';
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'excellent': return '#4caf50';
      case 'bon': return '#2196f3';
      case 'moyen': return '#ff9800';
      case 'insuffisant': return '#f44336';
      default: return '#757575';
    }
  }

  onSubmit(): void {
    if (this.evaluationForm.valid && this.stagiaire) {
      this.submitting = true;
      
      const evaluationData = {
        stagiaireId: this.stagiaire.id,
        tuteurId: this.authService.getCurrentUserId(),
        criteres: this.criteres.map(critere => ({
          critereId: critere.id,
          note: this.evaluationForm.get(critere.id)?.value,
          poids: critere.poids
        })),
        commentaire: this.evaluationForm.get('commentaire')?.value,
        recommandations: this.evaluationForm.get('recommandations')?.value
      };

      this.evaluationService.createEvaluationWithDefaultCriteres(evaluationData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.submitting = false;
            this.snackBar.open('Évaluation enregistrée avec succès !', 'Fermer', {
              duration: 3000
            });
            this.router.navigate(['/evaluation/dashboard']);
          },
          error: (error) => {
            this.submitting = false;
            console.error('Erreur lors de l\'enregistrement:', error);
            this.snackBar.open('Erreur lors de l\'enregistrement de l\'évaluation', 'Fermer', {
              duration: 3000
            });
          }
        });
    }
  }

  getStars(note: number): number[] {
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }

  isStarFilled(starIndex: number, note: number): boolean {
    return starIndex <= note;
  }

  setNote(critereId: string, note: number): void {
    if (this.formReady) {
      this.evaluationForm.get(critereId)?.setValue(note);
    }
  }

  getNote(critereId: string): number {
    return this.formReady ? (this.evaluationForm.get(critereId)?.value || 0) : 0;
  }
} 