import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="toolbar">
      <span>Festival App - Dashboard</span>
      <button class="logout-btn" (click)="logout()">
        🚪 Déconnexion
      </button>
    </div>

    <div class="dashboard-container">
      @if (currentUser) {
        <div class="card">
          <h2>Bienvenue, {{ currentUser.prenom }} {{ currentUser.nom }} !</h2>
          <p class="role-badge">Rôle: {{ currentUser.role }}</p>
          
          <div class="info-section">
            <p><strong>Email:</strong> {{ currentUser.email }}</p>
            <p><strong>Compte validé:</strong> {{ currentUser.valide ? '✅ Oui' : '⏳ Non' }}</p>
            
            @if (!currentUser.valide) {
              <div class="warning-box">
                ⚠️ Votre compte est en attente de validation par un administrateur.
              </div>
            }
          </div>

          @if (currentUser.role === 'ADMIN') {
            <div class="admin-section">
              <h3>Administration</h3>
              <a routerLink="/users" class="admin-link">
                👥 Gérer les utilisateurs
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #667eea;
      color: white;
      padding: 16px 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .dashboard-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .role-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .info-section {
      margin-top: 20px;
    }

    .info-section p {
      margin: 8px 0;
      color: #666;
    }

    .warning-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
      color: #856404;
    }

    .admin-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .admin-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .admin-link {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.3s;
    }

    .admin-link:hover {
      background: #5568d3;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
