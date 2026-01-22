import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Reservation,
  ReservationDetail,
  ReservationFilters,
  PaginationParams,
  PaginatedResponse,
  ReservationLine,
  ReservationContact,
  ReservationJeu,
  PriceCalculationResponse,
  StockCheckResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  CreateReservationLineRequest,
  UpdateReservationLineRequest,
  CreateReservationContactRequest,
  UpdateReservationContactRequest,
  CreateReservationJeuRequest,
  UpdateReservationJeuRequest,
  WorkflowStatus
} from '../models/reservation.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/reservations`;

  /**
   * Récupérer toutes les réservations avec filtres et pagination
   */
  getAllReservations(
    filters?: ReservationFilters,
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<Reservation>> {
    let params = new HttpParams();

    // Pagination
    if (pagination?.page) {
      params = params.set('page', pagination.page.toString());
    }
    if (pagination?.limit) {
      params = params.set('limit', pagination.limit.toString());
    }

    // Filtres
    if (filters?.editeurId) {
      params = params.set('editeurId', filters.editeurId.toString());
    }
    if (filters?.festivalId) {
      params = params.set('festivalId', filters.festivalId.toString());
    }
    if (filters?.workflowStatus) {
      params = params.set('workflowStatus', filters.workflowStatus);
    }
    if (filters?.typeReservant) {
      params = params.set('typeReservant', filters.typeReservant);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => ({
        data: response.data,
        total: response.total,
        currentPage: response.currentPage,
        totalPages: response.totalPages
      }))
    );
  }

  /**
   * Récupérer une réservation par ID avec tous les détails
   */
  getReservationById(id: number): Observable<ReservationDetail> {
    return this.http.get<{ success: boolean; reservation: ReservationDetail }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.reservation));
  }

  /**
   * Nettoyer et formater les données avant envoi
   */
  private sanitizeData(data: any): any {
    const cleanData = { ...data };

    // Conversion des nombres et gestion des null/undefined pour les champs obligatoires en BDD
    if (cleanData.valeurRemise !== undefined) {
      cleanData.valeurRemise = cleanData.valeurRemise === null || cleanData.valeurRemise === '' ? 0 : parseFloat(cleanData.valeurRemise.toString());
    }
    
    if (cleanData.nbPrisesElectriques !== undefined) {
      cleanData.nbPrisesElectriques = cleanData.nbPrisesElectriques === null || cleanData.nbPrisesElectriques === '' ? 0 : parseInt(cleanData.nbPrisesElectriques.toString(), 10);
    }

    // Suppression des champs immuables ou techniques qui ne doivent pas être envoyés
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    delete cleanData.editeur; // relations
    delete cleanData.festival;

    // Pour update/autosave, on retire les clés primaires composites si présentes
    // (géré aussi dans le composant, mais double sécurité)
    if (cleanData.editeurId) delete cleanData.editeurId;
    if (cleanData.festivalId) delete cleanData.festivalId;

    return cleanData;
  }

  /**
   * Créer une nouvelle réservation
   */
  createReservation(data: CreateReservationRequest): Observable<Reservation> {
    const sanitized = this.sanitizeData(data);
    // On garde editeurId et festivalId pour la création car obligatoires
    sanitized.editeurId = data.editeurId;
    sanitized.festivalId = data.festivalId;
    
    return this.http.post<{ success: boolean; reservation: Reservation }>(this.apiUrl, sanitized)
      .pipe(map(response => response.reservation));
  }

  /**
   * Mettre à jour une réservation existante
   */
  updateReservation(id: number, data: UpdateReservationRequest): Observable<Reservation> {
    const sanitizedData = this.sanitizeData(data);
    console.log('🔄 updateReservation - Sending to backend:', JSON.stringify(sanitizedData, null, 2));
    return this.http.put<{ success: boolean; reservation: Reservation }>(`${this.apiUrl}/${id}`, sanitizedData)
      .pipe(map(response => response.reservation));
  }

  /**
   * Supprimer une réservation (SUPER_ORGANISATEUR uniquement)
   */
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour le statut de workflow d'une réservation
   */
  updateWorkflowStatus(id: number, status: WorkflowStatus): Observable<Reservation> {
    return this.http.patch<{ success: boolean; reservation: Reservation }>(`${this.apiUrl}/${id}/workflow`, { status })
      .pipe(map(response => response.reservation));
  }

  /**
   * Sauvegarder automatiquement une réservation
   */
  autoSaveReservation(id: number, data: Partial<UpdateReservationRequest>): Observable<Reservation> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/autosave`, this.sanitizeData(data));
  }

  // ========== LIGNES DE RÉSERVATION (ESPACES) ==========

  /**
   * Ajouter une ligne de réservation (espace)
   */
  addReservationLine(reservationId: number, data: CreateReservationLineRequest): Observable<ReservationLine> {
    return this.http.post<{ success: boolean; line: ReservationLine }>(`${this.apiUrl}/${reservationId}/lines`, data)
      .pipe(map(response => response.line));
  }

  /**
   * Mettre à jour une ligne de réservation
   */
  updateReservationLine(
    reservationId: number,
    lineId: number,
    data: UpdateReservationLineRequest
  ): Observable<ReservationLine> {
  // Note: Backend route is /reservations/lines/:lineId (no reservationId in path)
    return this.http.put<{ success: boolean; line: ReservationLine }>(`${this.apiUrl}/lines/${lineId}`, data)
      .pipe(map(response => response.line));
  }

  /**
   * Supprimer une ligne de réservation
   */
  deleteReservationLine(reservationId: number, lineId: number): Observable<void> {
    // Note: Backend route is /reservations/lines/:lineId (no reservationId in path)
  return this.http.delete<void>(`${this.apiUrl}/lines/${lineId}`);
  }

  // ========== CONTACTS ==========

  /**
   * Ajouter un contact à une réservation
   */
  addReservationContact(
    reservationId: number,
    data: CreateReservationContactRequest
  ): Observable<ReservationContact> {
    return this.http.post<{ success: boolean; contact: ReservationContact }>(`${this.apiUrl}/${reservationId}/contacts`, data)
      .pipe(map(response => response.contact));
  }

  /**
   * Mettre à jour un contact
   */
  updateReservationContact(
    reservationId: number,
    contactId: number,
    data: UpdateReservationContactRequest
  ): Observable<ReservationContact> {
    // Assuming backend follows same pattern
    return this.http.put<{ success: boolean; contact: ReservationContact }>(`${this.apiUrl}/${reservationId}/contacts/${contactId}`, data)
      .pipe(map(response => response.contact));
  }

  /**
   * Supprimer un contact
   */
  deleteReservationContact(reservationId: number, contactId: number): Observable<void> {
    // Note: reservationId is not used in the URL but kept for consistency with other methods
    return this.http.delete<void>(`${this.apiUrl}/contacts/${contactId}`);
  }

  // ========== JEUX ==========

  /**
   * Ajouter un jeu à une réservation
   */
  addReservationJeu( reservationId: number, data: CreateReservationJeuRequest): Observable<ReservationJeu> {
    return this.http.post<{ success: boolean; jeu: ReservationJeu }>(`${this.apiUrl}/${reservationId}/jeux`, data).pipe(map(response => response.jeu));
    


  }

  /**
   * Mettre à jour l'affectation d'un jeu
   */
  updateReservationJeu(
    reservationId: number,
    jeuId: number,
    data: UpdateReservationJeuRequest
  ): Observable<ReservationJeu> {
    // Note: Backend route is /reservations/jeux/:jeuId (no reservationId in path)
    return this.http.put<{ success: boolean; jeu: ReservationJeu }>(`${this.apiUrl}/jeux/${jeuId}`, data)
      .pipe(map(response => response.jeu));
  }

  /**
   * Supprimer un jeu d'une réservation
   */
  deleteReservationJeu(reservationId: number, jeuId: number): Observable<void> {
    // Note: Backend route is /reservations/jeux/:jeuId (no reservationId in path)
    return this.http.delete<void>(`${this.apiUrl}/jeux/${jeuId}`);
  }

  // ========== CALCUL DE PRIX ==========

  /**
   * Calculer le prix d'une réservation
   */
  calculatePrice(reservationId: number): Observable<PriceCalculationResponse> {
    return this.http.get<PriceCalculationResponse>(`${this.apiUrl}/${reservationId}/calculate-price`);
  }

  // ========== VÉRIFICATION DE STOCK ==========

  /**
   * Vérifier la disponibilité du stock pour une zone et un festival
   */
  checkStockAvailable(
    festivalId: number,
    zoneTarifaireId: number,
    nbTables: number,
    nbM2?: number
  ): Observable<StockCheckResponse> {
    let params = new HttpParams()
      .set('festivalId', festivalId.toString())
      .set('zoneTarifaireId', zoneTarifaireId.toString())
      .set('nbTables', nbTables.toString());

    if (nbM2 !== undefined) {
      params = params.set('nbM2', nbM2.toString());
    }

    return this.http.get<StockCheckResponse>(`${this.apiUrl}/check-stock`, { params });
  }
}
