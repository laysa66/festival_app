import { WorkflowStatus, TypeReservant, TypeRemise } from '@prisma/client';

// ============================================
// INTERFACES POUR LES ENTITÉS
// ============================================

export interface ReservationLineItem {
  id: number;
  zoneTarifaireId: number;
  nbTables: number;
  nbM2: number;
  grandesTablesSouhaitees: boolean;
  sousTotal: number;
}

export interface ReservationContactItem {
  id: number;
  dateContact: Date;
  commentaire?: string;
}

export interface ReservationJeuItem {
  id: number;
  jeuId: number;
  editeurJeuId?: number;
  zonePlanId?: number;
  nbExemplaires: number;
  nbTablesAllouees: number;
}

export interface ReservationDetail {
  id: number;
  editeurId: number;
  festivalId: number;
  workflowStatus: WorkflowStatus;
  typeReservant: TypeReservant;
  dateFacturation?: Date;
  viendraPresenteSesJeux: boolean;
  nousPresentons: boolean;
  listeJeuxDemandee: boolean;
  listeJeuxObtenue: boolean;
  jeuxRecusPhysiquement: boolean;
  notesClient?: string;
  notesWorkflow?: string;
  nbPrisesElectriques: number;
  typeRemise?: TypeRemise;
  valeurRemise: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  editeur?: {
    id: number;
    libelle: string;
    email?: string;
    phone?: string;
  };
  festival?: {
    id: number;
    nom: string;
    dateDebut: Date;
    dateFin: Date;
  };
  reservationLines?: ReservationLineItem[];
  reservationContacts?: ReservationContactItem[];
  reservationJeux?: ReservationJeuItem[];
}

export interface ReservationListItem {
  id: number;
  editeurId: number;
  festivalId: number;
  workflowStatus: WorkflowStatus;
  typeReservant: TypeReservant;
  editeur: {
    libelle: string;
  };
  festival: {
    nom: string;
  };
  totalTables: number;
  totalPrice: number;
  createdAt: Date;
}

// ============================================
// INTERFACES POUR LES REQUÊTES
// ============================================

export interface CreateReservationRequest {
  editeurId: number;
  festivalId: number;
  typeReservant?: TypeReservant;
  notesClient?: string;
}

export interface UpdateReservationRequest {
  workflowStatus?: WorkflowStatus;
  typeReservant?: TypeReservant;
  dateFacturation?: Date;
  viendraPresenteSesJeux?: boolean;
  nousPresentons?: boolean;
  listeJeuxDemandee?: boolean;
  listeJeuxObtenue?: boolean;
  jeuxRecusPhysiquement?: boolean;
  notesClient?: string;
  notesWorkflow?: string;
  nbPrisesElectriques?: number;
  typeRemise?: TypeRemise;
  valeurRemise?: number;
}

export interface AddReservationLineRequest {
  zoneTarifaireId: number;
  nbTables: number;
  nbM2?: number;
  grandesTablesSouhaitees?: boolean;
}

export interface UpdateReservationLineRequest {
  nbTables?: number;
  nbM2?: number;
  grandesTablesSouhaitees?: boolean;
}

export interface AddReservationContactRequest {
  dateContact: Date | string;
  commentaire?: string;
}

export interface AddReservationJeuRequest {
  jeuId: number;
  editeurJeuId?: number;
  zonePlanId?: number;
  nbExemplaires: number;
  nbTablesAllouees: number;
}

export interface UpdateReservationJeuRequest {
  zonePlanId?: number;
  nbExemplaires?: number;
  nbTablesAllouees?: number;
}

// ============================================
// INTERFACES POUR LES RÉPONSES
// ============================================

export interface ReservationResponse {
  success: true;
  reservation: ReservationDetail;
  message?: string;
}

export interface ReservationListResponse {
  success: true;
  reservations: ReservationListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PriceCalculationResponse {
  success: true;
  totalTables: number;
  totalM2: number;
  sousTotal: number;
  coutPrises: number;
  remise: number;
  totalGeneral: number;
}

export interface StockCheckResponse {
  success: true;
  available: boolean;
  currentStock: number;
  requested: number;
  remaining: number;
}

// ============================================
// INTERFACES POUR LES FILTRES
// ============================================

export interface ReservationFilters {
  festivalId?: number;
  editeurId?: number;
  workflowStatus?: WorkflowStatus;
  typeReservant?: TypeReservant;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// INTERFACES POUR LES VALIDATIONS
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// CONSTANTES
// ============================================

export const PRIX_PRISE_ELECTRIQUE = 250;
export const RATIO_M2_PAR_TABLE = 4.5;
export const MAX_JEUX_PAR_TABLE = 2;
