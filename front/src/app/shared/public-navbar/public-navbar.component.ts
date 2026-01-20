import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <mat-toolbar class="public-navbar">
      <div class="navbar-container">
        <!-- Logo / Home -->
        <div class="navbar-brand">
          <button mat-button routerLink="/" class="brand-button">
            <mat-icon>festival</mat-icon>
            <span class="brand-text">Festival App</span>
          </button>
        </div>

        <!-- Main Navigation -->
        <div class="navbar-menu">
          <a routerLink="/" mat-button routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>home</mat-icon>
            Accueil
          </a>
          <a routerLink="/public/games" mat-button routerLinkActive="active">
            <mat-icon>games</mat-icon>
            Jeux
          </a>
          <a routerLink="/public/zones-tarifaires" mat-button routerLinkActive="active">
            <mat-icon>local_offer</mat-icon>
            Zones Tarifaires
          </a>
          <a routerLink="/public/zones-plan" mat-button routerLinkActive="active">
            <mat-icon>map</mat-icon>
            Zones du Plan
          </a>
        </div>

        <!-- Auth Links -->
        <div class="navbar-auth">
          <a routerLink="/login" mat-button>
            <mat-icon>login</mat-icon>
            Connexion
          </a>
          <a routerLink="/register" mat-raised-button color="primary">
            <mat-icon>person_add</mat-icon>
            Inscription
          </a>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .public-navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 0 20px;
    }

    .navbar-brand {
      flex-shrink: 0;
    }

    .brand-button {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 1.1em;
      font-weight: 700;
      text-transform: none;
    }

    .brand-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .brand-text {
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .navbar-menu {
      display: flex;
      gap: 8px;
      flex: 1;
      justify-content: center;
      margin: 0 40px;
    }

    .navbar-menu a {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .navbar-menu a:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-menu a.active {
      color: white;
      border-bottom: 3px solid white;
      font-weight: 700;
    }

    .navbar-auth {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .navbar-auth a {
      display: flex;
      align-items: center;
      gap: 6px;
      color: white;
    }

    .navbar-auth a:hover {
      opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .navbar-menu {
        margin: 0 20px;
        gap: 4px;
      }

      .navbar-menu a {
        font-size: 0.9em;
      }

      .brand-text {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-wrap: wrap;
        padding: 8px 12px;
      }

      .navbar-menu {
        order: 3;
        width: 100%;
        margin: 8px 0;
        justify-content: space-around;
      }

      .navbar-menu a {
        font-size: 0.8em;
      }

      .navbar-auth {
        gap: 8px;
      }

      .navbar-auth a {
        font-size: 0.8em;
        padding: 4px 8px !important;
      }

      .navbar-auth a mat-icon {
        display: none;
      }
    }
  `]
})
export class PublicNavbarComponent {}
