export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'ui-element',
    title: 'UI ELEMENT',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'basic',
        title: 'Component',
        type: 'collapse',
        icon: 'feather icon-box',
        children: [
          {
            id: 'button',
            title: 'Button',
            type: 'item',
            url: '/basic/button'
          },
          
          {
            id: 'breadcrumb-pagination',
            title: 'Breadcrumb & Pagination',
            type: 'item',
            url: '/basic/breadcrumb-paging'
          },
          
          {
            id: 'tabs-pills',
            title: 'Tabs & Pills',
            type: 'item',
            url: '/basic/tabs-pills'
          },
          {
            id: 'typography',
            title: 'Typography',
            type: 'item',
            url: '/basic/typography'
          }
        ]
      }
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Tables',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'forms-element',
        title: 'Form Elements',
        type: 'item',
        url: '/forms/basic',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'tables',
        title: 'Tables',
        type: 'item',
        url: '/tables/bootstrap',
        classes: 'nav-item',
        icon: 'feather icon-server'
      }
    ]
  },
  {
    id: 'chart-maps',
    title: 'Chart',
    type: 'group',
    icon: 'icon-charts',
    children: [
      {
        id: 'apexChart',
        title: 'ApexChart',
        type: 'item',
        url: 'apexchart',
        classes: 'nav-item',
        icon: 'feather icon-pie-chart'
      }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'icon-pages',
    children: [
      
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'feather icon-sidebar'
      }
    ]
  }
];
export const ADMIN_ITEMS: NavigationItem[] = [
  {
    id: 'admin',
    title: 'Admin Section',
    type: 'group',
    children: [
      {
        id: 'dashboard Admin',
        title: 'Dashboard Admin',
        type: 'item',
        url: '/admin-dashboard',
        icon: 'feather icon-home'
      },
   
      {
        id: 'admin-documents',
        title: 'Documents Stagiaires',
        type: 'item',
        url: '/admin-documents',
        icon: 'feather icon-edit'
      }
     
      
      
    ]
  }
];

export const TUTEUR_ITEMS: NavigationItem[] = [
  {
    id: 'tuteur',
    title: 'Espace Tuteur',
    type: 'group',
    children: [
      {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: 'feather icon-home',
      classes: 'nav-item'
    },
      {
        id: 'mes-stagiaires',
        title: 'Mes Stagiaires',
        type: 'item',
        url: '/stagiaires-tuteur',
        icon: 'feather icon-user-check'
      },
      
      {
        id: 'forms-element',
        title: 'Tache',
        type: 'item',
        url: '/forms/basic',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'forms-element',
        title: 'Evaluation',
        type: 'item',
        url: '/evaluation/dashboard',
        classes: 'nav-item',
        icon: 'feather icon-star'
      },
       {
        id: 'forms-element',
        title: 'Meeting',
        type: 'item',
        url: '/meeting/create',
        classes: 'nav-item',
        icon: 'feather icon-video'
      },
      {
        id: 'tables',
        title: 'meetingjoin',
        type: 'item',
        url: '/meeting/:roomID',
        classes: 'nav-item',
        icon: 'feather icon-server'
      }
      
    ]
  }
];

export const STAGIAIRE_ITEMS: NavigationItem[] = [
  {
    id: 'stagiaire',
    title: 'Espace Stagiaire',
    type: 'group',
    children: [
      {
        id: 'stagiaire-dashboard',
        title: 'Mon Dashboard',
        type: 'item',
        url: '/stagiaire-dash',
        icon: 'feather icon-home'
      },
      
      {
        id: 'calendrier',
        title: 'Calendrier',
        type: 'item',
        url: '/tables/bootstrap',
        classes: 'nav-item',
        icon: 'feather icon-calendar'
      },
      {
        id: 'board',
        title: 'Tableau (Kanban)',
        type: 'item',
        url: '/apexchart',
        classes: 'nav-item',
        icon: 'feather icon-grid'
      },
      {
        id: 'taches',
        title: 'Tâches',
        type: 'item',
        url: '/tache',
        classes: 'nav-item',
        icon: 'feather icon-list'
      },{
        id: 'mes-demandes',
        title: 'Mes demandes',
        type: 'item',
        url: '/stagiaires-documents',
        icon: 'feather icon-edit'
      }
    ]
  }
];
