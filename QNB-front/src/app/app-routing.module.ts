import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    component: GuestComponent,
    children: [
      {
        path: 'signin',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then(m => m.default)
      },
      {
        path: 'signup',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then(m => m.default)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dash',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadChildren: () => import('./demo/pages/form-elements/form-elements.module').then((m) => m.FormElementsModule)
      },
      {
        path: 'tables',
        loadChildren: () => import('./demo/pages/tables/tables.module').then((m) => m.TablesModule)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component')
      },
      {
        path: 'tache',
        loadComponent: () => import('./demo/pages/tache-stagiaire/tache-stagiaire.component').then(m => m.TacheStagiaireComponent)
      },
      {
        path: 'stagiaires-tuteur',
        loadComponent: () => import('./demo/pages/stagiaires-tuteur/stagiaires-tuteur.component').then(m => m.StagiairesTuteurComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./demo/pages/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'dash',
        loadComponent: () => import('./demo/pages/stagiaire-dashboard/stagiaire-dashboard.component').then(m => m.StagiaireDashboardComponent)
      },
      {
        path: 'chat/stagiaire',
        loadComponent: () => import('./demo/pages/chat/stagiaire-chat/stagiaire-chat.component').then(m => m.StagiaireChatComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
