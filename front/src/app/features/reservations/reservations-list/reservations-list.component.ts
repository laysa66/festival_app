import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  Reservation,
  ReservationFilters,
  PaginationParams,
  WorkflowStatus,
  TypeReservant,
  TypeRemise,
  WORKFLOW_STATUS_LABELS,
  TYPE_RESERVANT_LABELS,
  TYPE_REMISE_LABELS
} from '../../../core/models/reservation.interface';
import { UserRole } from '../../../core/models/user.interface';

@Component({
  selector: 'app-reservations-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.css',
})
export class ReservationsListComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Données
  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = signal(0);

  // Filtres
  filters: ReservationFilters = {};
  searchTerm = '';
  selectedWorkflowStatus = '';
  selectedTypeReservant = '';

  // Enums pour les templates
  WorkflowStatus = WorkflowStatus;
  TypeReservant = TypeReservant;
  TypeRemise = TypeRemise;
  WORKFLOW_STATUS_LABELS = WORKFLOW_STATUS_LABELS;
  TYPE_RESERVANT_LABELS = TYPE_RESERVANT_LABELS;
  TYPE_REMISE_LABELS = TYPE_REMISE_LABELS;
  
  // Panel workflow expansion
  expandedReservationId = signal<number | null>(null);

  // Permissions
  currentUser: any = null;
  canDelete = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canDelete = user?.role === UserRole.SUPER_ORGANISATEUR || 
                       user?.role === UserRole.ADMIN;
      //console.log('👤 User in ReservationsList:', user);
      //console.log('🔑 Can delete:', this.canDelete);
    });
    //console.log('📋 Loading reservations...');
    this.loadReservations();
  }

  /**
   * Charger les réservations avec filtres et pagination
   */
  loadReservations(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: ReservationFilters = {
      ...this.filters,
      search: this.searchTerm || undefined,
      workflowStatus: this.selectedWorkflowStatus as WorkflowStatus || undefined,
      typeReservant: this.selectedTypeReservant as TypeReservant || undefined
    };

    const pagination: PaginationParams = {
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.reservationService.getAllReservations(filters, pagination).subscribe({
      next: (response) => {
        this.reservations.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.currentPage);
        this.loading.set(false);
      },
      error: (err) => {
        //console.error('Erreur lors du chargement des réservations:', err);
        this.error.set('Erreur lors du chargement des réservations');
        this.loading.set(false);
      }
    });
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadReservations();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedWorkflowStatus = '';
    this.selectedTypeReservant = '';
    this.filters = {};
    this.currentPage.set(1);
    this.loadReservations();
  }

  /**
   * Changer de page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadReservations();
    }
  }

  /**
   * Page précédente
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /**
   * Page suivante
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /**
   * Créer une nouvelle réservation
   */
  createReservation(): void {
    this.router.navigate(['/reservations/new']);
  }

  /**
   * Voir les détails d'une réservation
   */
  viewReservation(id: number): void {
    this.router.navigate(['/reservations', id]);
  }

  /**
   * Éditer une réservation
   */
  editReservation(id: number): void {
    this.router.navigate(['/reservations', id, 'edit']);
  }

  /**
   * Supprimer une réservation
   */
  deleteReservation(id: number, nom: string): void {
    if (!this.canDelete) {
      alert('Vous n\'avez pas les permissions pour supprimer une réservation');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer la réservation "${nom}" ?`)) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => {
          //console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression de la réservation');
        }
      });
    }
  }

  /**
   * Obtenir la classe CSS pour le badge de statut
   */
  getStatusClass(status: WorkflowStatus): string {
    const classes: Record<WorkflowStatus, string> = {
      [WorkflowStatus.PAS_DE_CONTACT]: 'badge-draft',
      [WorkflowStatus.CONTACT_PRIS]: 'badge-pending',
      [WorkflowStatus.DISCUSSION_EN_COURS]: 'badge-in-progress',
      [WorkflowStatus.SERA_ABSENT]: 'badge-cancelled',
      [WorkflowStatus.CONSIDERE_ABSENT]: 'badge-cancelled',
      [WorkflowStatus.PRESENT]: 'badge-confirmed',
      [WorkflowStatus.FACTURE]: 'badge-validated',
      [WorkflowStatus.FACTURE_PAYEE]: 'badge-completed'
    };
    return classes[status] || 'badge-default';
  }

  /**
   * Obtenir les numéros de pages à afficher
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const pages: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Obtenir l'étape du workflow (1-4) pour les indicateurs de progression
   */
  getWorkflowStep(status: WorkflowStatus): number {
    const steps: Record<WorkflowStatus, number> = {
      [WorkflowStatus.PAS_DE_CONTACT]: 0,
      [WorkflowStatus.CONTACT_PRIS]: 1,
      [WorkflowStatus.DISCUSSION_EN_COURS]: 2,
      [WorkflowStatus.SERA_ABSENT]: 1,
      [WorkflowStatus.CONSIDERE_ABSENT]: 1,
      [WorkflowStatus.PRESENT]: 3,
      [WorkflowStatus.FACTURE]: 4,
      [WorkflowStatus.FACTURE_PAYEE]: 4
    };
    return steps[status] || 0;
  }

  /**
   * Obtenir une description courte du statut workflow
   */
  getWorkflowDescription(status: WorkflowStatus): string {
    const descriptions: Record<WorkflowStatus, string> = {
      [WorkflowStatus.PAS_DE_CONTACT]: 'Aucun contact',
      [WorkflowStatus.CONTACT_PRIS]: 'En attente',
      [WorkflowStatus.DISCUSSION_EN_COURS]: 'Négociation',
      [WorkflowStatus.SERA_ABSENT]: 'Non présent',
      [WorkflowStatus.CONSIDERE_ABSENT]: 'Sans réponse',
      [WorkflowStatus.PRESENT]: 'Confirmé',
      [WorkflowStatus.FACTURE]: 'À payer',
      [WorkflowStatus.FACTURE_PAYEE]: 'Terminé'
    };
    return descriptions[status] || '';
  }

  /**
   * Vérifie si le statut est négatif (absent)
   */
  isNegativeStatus(status: WorkflowStatus): boolean {
    return status === WorkflowStatus.SERA_ABSENT || 
           status === WorkflowStatus.CONSIDERE_ABSENT;
  }

  /**
   * Toggle le panel de gestion du workflow pour une réservation
   */
  toggleWorkflowPanel(reservationId: number | null): void {
    if (this.expandedReservationId() === reservationId) {
      this.expandedReservationId.set(null);
    } else {
      this.expandedReservationId.set(reservationId);
    }
  }

  /**
   * Mettre à jour un champ du workflow d'une réservation
   */
  updateReservationWorkflow(reservationId: number, field: string, value: any): void {
    const updateData: any = { [field]: value };
    
    this.reservationService.updateReservation(reservationId, updateData).subscribe({
      next: (updatedReservation) => {
        // Mettre à jour la liste locale
        const currentReservations = this.reservations();
        const updated = currentReservations.map(r => 
          r.id === reservationId ? { ...r, ...updateData } : r
        );
        this.reservations.set(updated);
        //console.log('Workflow mis à jour:', field, value);
      },
      error: (err) => {
        //e.error('Erreur mise à jour workflow:', err);
        this.error.set('Erreur lors de la mise à jour du workflow');
      }
    });
  }
}
