// src/app/layout/admin/navigation/navigation.service.ts

import { Injectable } from '@angular/core';
import { ADMIN_ITEMS, NavigationItem, STAGIAIRE_ITEMS, TUTEUR_ITEMS } from 'src/app/theme/layout/admin/navigation/navigation';


@Injectable({ providedIn: 'root' })
export class NavigationService {
  getNavigationByRole(role: string): NavigationItem[] {
    switch (role) {
      case 'ADMIN':
        return ADMIN_ITEMS;
      case 'TUTEUR':
        return TUTEUR_ITEMS;
      case 'STAGIAIRE':
        return STAGIAIRE_ITEMS;
      default:
        return [];
    }
  }
}
