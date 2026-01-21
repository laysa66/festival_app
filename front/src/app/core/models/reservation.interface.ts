// Enums correspondants au backend
export enum WorkflowStatus {
  PAS_DE_CONTACT = 'PAS_DE_CONTACT',
  CONTACT_PRIS = 'CONTACT_PRIS',
  DISCUSSION_EN_COURS = 'DISCUSSION_EN_COURS',
  SERA_ABSENT = 'SERA_ABSENT',
  CONSIDERE_ABSENT = 'CONSIDERE_ABSENT',
  PRESENT = 'PRESENT',
  FACTURE = 'FACTURE',
  FACTURE_PAYEE = 'FACTURE_PAYEE',
}

export enum TypeReservant {
  EDITEUR = 'EDITEUR',
  PRESTATAIRE = 'PRESTATAIRE',
  ANIMATION = 'ANIMATION',
  ASSO = 'ASSO',
  BOUTIQUE = 'BOUTIQUE',
}

export enum TypeRemise {
  TABLES_OFFERTES = 'TABLES_OFFERTES',
  SOMME_ARGENT = 'SOMME_ARGENT',
}

// Interfaces pour les entités
export interface ReservationDetail extends Reservation {
  reservationLines?: ReservationLine[];
  reservationContacts?: ReservationContact[];
  reservationJeux?: ReservationJeu[];
}

export interface ReservationLine {
  id: number;
  zoneTarifaireId: number;
  zoneTarifaire?: {
    id: number;
    nom: string;
    prixTable: number;
    prixM2: number;
  };
  nbTables: number;
  nbM2: number;
  grandesTablesSouhaitees: boolean;
  sousTotal: number;
}

export interface ReservationContact {
  id: number;
  dateContact: Date | string;
  commentaire?: string;
}

export interface ReservationJeu {
  id: number;
  jeuId: number;
  jeu?: {
    id: number;
    libelle: string;
    auteur?: string;
  };
  editeurJeuId?: number;
  editeurJeu?: {
    id: number;
    libelle: string;
  };
  zonePlanId?: number;
  zonePlan?: {
    id: number;
    nom: string;
  };
  nbExemplaires: number;
  nbTablesAllouees: number;
}

export interface Reservation {
  id: number;
  editeurId: number;
  festivalId: number;
  workflowStatus: WorkflowStatus;
  typeReservant: TypeReservant;
  dateFacturation?: Date | string;
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
  createdAt: Date | string;
  updatedAt: Date | string;
  
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
    dateDebut: Date | string;
    dateFin: Date | string;
  };
  reservationLines?: ReservationLine[];
  reservationContacts?: ReservationContact[];
  reservationJeux?: ReservationJeu[];
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
  createdAt: Date | string;
}

// Interfaces pour les requêtes
export interface CreateReservationRequest {
  editeurId: number;
  festivalId: number;
  typeReservant?: TypeReservant;
  notesClient?: string;
}

export interface UpdateReservationRequest {
  workflowStatus?: WorkflowStatus;
  typeReservant?: TypeReservant;
  dateFacturation?: Date | string;
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

export interface CreateReservationLineRequest {
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

export interface CreateReservationContactRequest {
  dateContact: Date | string;
  commentaire?: string;
}

export interface UpdateReservationContactRequest {
  dateContact?: Date | string;
  commentaire?: string;
}

export interface CreateReservationJeuRequest {
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

// Interfaces pour les réponses
export interface PriceCalculationResponse {
  totalTables: number;
  totalM2: number;
  sousTotal: number;
  coutPrises: number;
  remise: number;
  totalGeneral: number;
}

export interface StockCheckResponse {
  available: boolean;
  currentStock: number;
  requested: number;
  remaining: number;
}

// Interfaces pour les filtres
export interface ReservationFilters {
  festivalId?: number;
  editeurId?: number;
  workflowStatus?: WorkflowStatus;
  typeReservant?: TypeReservant;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Constantes
export const PRIX_PRISE_ELECTRIQUE = 250;
export const RATIO_M2_PAR_TABLE = 4.5;
export const MAX_JEUX_PAR_TABLE = 2;

// Labels pour affichage
export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.PAS_DE_CONTACT]: 'Pas encore de contact',
  [WorkflowStatus.CONTACT_PRIS]: 'Contact pris',
  [WorkflowStatus.DISCUSSION_EN_COURS]: 'Discussion en cours',
  [WorkflowStatus.SERA_ABSENT]: 'Sera absent',
  [WorkflowStatus.CONSIDERE_ABSENT]: 'Considéré absent',
  [WorkflowStatus.PRESENT]: 'Présent',
  [WorkflowStatus.FACTURE]: 'Facturé',
  [WorkflowStatus.FACTURE_PAYEE]: 'Facture payée',
};

export const TYPE_RESERVANT_LABELS: Record<TypeReservant, string> = {
  [TypeReservant.EDITEUR]: 'Éditeur',
  [TypeReservant.PRESTATAIRE]: 'Prestataire',
  [TypeReservant.ANIMATION]: 'Animation',
  [TypeReservant.ASSO]: 'Association',
  [TypeReservant.BOUTIQUE]: 'Boutique',
};

export const TYPE_REMISE_LABELS: Record<TypeRemise, string> = {
  [TypeRemise.TABLES_OFFERTES]: 'Tables offertes',
  [TypeRemise.SOMME_ARGENT]: 'Somme d\'argent',
};
