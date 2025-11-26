import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '@app/layout/common/sidebar/sidebar.component';
import { HeaderComponent } from '@app/layout/common/header/header.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './authenticated.component.html',
  styleUrls: ['./authenticated.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayoutComponent implements OnDestroy {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  // Current page title
  public pageTitle = signal<string>('');

  // Sidebar state
  public sidebarOpen = signal<boolean>(true);

  // Subscription for route changes
  private _routeSubscription?: Subscription;

  constructor() {
    this._updatePageTitle();
    
    // Update title when route changes
    this._routeSubscription = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this._updatePageTitle();
      });
  }

  ngOnDestroy(): void {
    if (this._routeSubscription) {
      this._routeSubscription.unsubscribe();
    }
  }

  /**
   * Toggle sidebar
   */
  onToggleSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
      this.sidebarOpen.set(this.sidebar.isOpen());
    }
  }

  /**
   * Update page title from route data
   */
  private _updatePageTitle(): void {
    try {
      let route = this._activatedRoute;
      while (route?.firstChild) {
        route = route.firstChild;
      }

      const title = route?.snapshot?.data?.['title'];

      if (title) {
        this.pageTitle.set(title);
        return;
      }
    } catch (error) {
      console.error('Error updating page title:', error);
    }

    const path = this._router.url;
    if (path.includes('/dashboard')) {
      this.pageTitle.set('navigation.dashboard');
    } else if (path.includes('/processes')) {
      this.pageTitle.set('process.title');
    } else if (path.includes('/templates')) {
      this.pageTitle.set('templates.title');
    } else {
      this.pageTitle.set('');
    }
  }
}

