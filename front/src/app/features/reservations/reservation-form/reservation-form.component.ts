import { Component, OnInit, OnDestroy, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, Observable } from 'rxjs';
import { ReservationService } from '../../../core/services/reservation.service';
import { EditeursService, Editeur } from '../../../core/services/editeurs.service';
import { FestivalService } from '../../../core/services/festival.service';
import { JeuService, Jeu, JeuCreateRequest } from '../../../core/services/jeu.service';
import { Festival, ZonePlan, ZoneTarifaire } from '../../../core/models/festival';
import {
  ReservationDetail,
  ReservationJeu,
  ReservationLine,
  CreateReservationLineRequest,
  CreateReservationContactRequest,
  PriceCalculationResponse,
  WorkflowStatus,
  TypeReservant,
  TypeRemise,
  WORKFLOW_STATUS_LABELS,
  TYPE_RESERVANT_LABELS,
  TYPE_REMISE_LABELS
} from '../../../core/models/reservation.interface';

@Component({
  selector: 'app-reservation-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css',
})
export class ReservationFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly reservationService = inject(ReservationService);
  private readonly editeursService = inject(EditeursService);
  private readonly festivalService = inject(FestivalService);
  private readonly jeuService = inject(JeuService);
  private readonly destroy$ = new Subject<void>();
  
  // Subject pour la recherche avec debounce
  private searchTerms = new Subject<string>();

  constructor() {
    // Configuration de la recherche avec debounce
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (!term || term.length < 2) {
          return new Observable<Jeu[]>(obs => obs.next([]));
        }
        this.searchingGames.set(true);
        return this.jeuService.searchGames(term, 20);
      })
    ).subscribe({
      next: (jeux) => {
        this.gameSearchResults.set(jeux);
        this.searchingGames.set(false);
      },
      error: (err) => {
        console.error('Erreur recherche jeux:', err);
        this.gameSearchResults.set([]);
        this.searchingGames.set(false);
      }
    });
  }

  // État
  reservationId: number | null = null;
  isEditMode = false;
  currentTab = signal(0);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  reservation = signal<ReservationDetail | null>(null);
  
  // Listes pour les selects
  editeursList = signal<Editeur[]>([]);
  festivalsList = signal<Festival[]>([]);
  zonePlansList = signal<ZonePlan[]>([]);
  
  // Gestion des jeux
  gameSearchQuery = signal('');
  gameSearchResults = signal<Jeu[]>([]);
  searchingGames = signal(false);
  showNewGameForm = signal(false);
  newGameData = signal<Partial<JeuCreateRequest>>({ libelle: '' });
  savingGame = signal(false);
  addingGameId = signal<number | null>(null);
  
  // Gestion des espaces (lignes de réservation)
  zoneTarifairesList = signal<ZoneTarifaire[]>([]);
  newLineData = signal<Partial<CreateReservationLineRequest>>({});
  addingLine = signal(false);
  // Création rapide de zone tarifaire
  showNewZoneForm = signal(false);
  creatingZone = signal(false);
  newZoneData = signal<{ nom?: string; prixTable?: number; prixM2?: number }>({});
  newZoneM2Touched = signal(false);
  // Création rapide de zone du plan
  showNewZonePlanForm = signal(false);
  creatingZonePlan = signal(false);
  newZonePlanData = signal<{ nom?: string; zoneTarifaireId?: number }>({});
  
  // Gestion des contacts
  newContactData = signal<Partial<CreateReservationContactRequest>>({ dateContact: new Date().toISOString().split('T')[0] });
  addingContact = signal(false);

  // Facturation
  priceSummary = signal<PriceCalculationResponse | null>(null);
  priceLoading = signal(false);

  // Formulaire
  reservationForm!: FormGroup;

  // Onglets
  tabs = [
    { id: 0, label: 'Informations générales', icon: 'pi pi-id-card' },
    { id: 1, label: 'Espaces', icon: 'pi pi-table' },
    { id: 2, label: 'Jeux', icon: 'pi pi-objects-column' }, // ou pi-th-large
    { id: 3, label: 'Placement', icon: 'pi pi-map' },
    { id: 4, label: 'Contacts', icon: 'pi pi-phone' }
  ];

  // Enums pour les templates
  WorkflowStatus = WorkflowStatus;
  TypeReservant = TypeReservant;
  TypeRemise = TypeRemise;
  WORKFLOW_STATUS_LABELS = WORKFLOW_STATUS_LABELS;
  TYPE_RESERVANT_LABELS = TYPE_RESERVANT_LABELS;
  TYPE_REMISE_LABELS = TYPE_REMISE_LABELS;

  ngOnInit(): void {
    this.initForm();
    this.loadEditeurs();
    this.loadFestivals();
    this.checkRouteParams();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    this.reservationForm = this.fb.group({
      // Informations générales
      editeurId: [null, Validators.required],
      festivalId: [null, Validators.required],
      typeReservant: [TypeReservant.EDITEUR, Validators.required],
      
      // Workflow
      workflowStatus: [WorkflowStatus.PAS_DE_CONTACT, Validators.required],
      
      // Tarification
      typeRemise: [null],
      valeurRemise: [0, [Validators.min(0)]],
      
      // Détails
      viendraPresenteSesJeux: [false],
      nousPresentons: [false],
      listeJeuxDemandee: [false],
      listeJeuxObtenue: [false],
      jeuxRecusPhysiquement: [false],
      nbPrisesElectriques: [0, [Validators.min(0)]],
      
      // Notes
      notesClient: [''],
      notesWorkflow: ['']
    });
  }

  /**
   * Vérifier les paramètres de route
   */
  checkRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.reservationId = +id;
        this.isEditMode = true;
        this.loadReservation(this.reservationId);
      }
    });
  }

  onRemiseChange(): void {
    if (this.reservationId) {
      this.calculatePrice();
    }
  }

  /**
   * Charger la liste des éditeurs
   */
  loadEditeurs(): void {
    this.editeursService.getEditeurs().subscribe({
      next: (data) => this.editeursList.set(data),
      error: (err) => console.error('Erreur chargement éditeurs:', err)
    });
  }

  /**
   * Charger la liste des festivals
   */
  loadFestivals(): void {
    this.festivalService.getAllFestivals().subscribe({
      next: (data) => this.festivalsList.set(data),
      error: (err) => console.error('Erreur chargement festivals:', err)
    });
  }

  /**
   * Charger une réservation existante
   */
  loadReservation(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.reservationService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservation.set(data);
        this.patchFormWithData(data);
        // Load zone plans and zone tarifaires for this festival
        if (data.festivalId) {
          this.loadZonePlans(data.festivalId);
          this.loadZoneTarifaires(data.festivalId);
        }
        if (this.reservationId) {
          this.calculatePrice();
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la réservation:', err);
        this.error.set('Erreur lors du chargement de la réservation');
        this.loading.set(false);
      }
    });
  }

  /**
   * Remplir le formulaire avec les données
   */
  patchFormWithData(data: ReservationDetail): void {
    this.reservationForm.patchValue({
      editeurId: data.editeurId,
      festivalId: data.festivalId,
      typeReservant: data.typeReservant,
      workflowStatus: data.workflowStatus,
      typeRemise: data.typeRemise,
      valeurRemise: data.valeurRemise,
      viendraPresenteSesJeux: data.viendraPresenteSesJeux,
      nousPresentons: data.nousPresentons,
      listeJeuxDemandee: data.listeJeuxDemandee,
      listeJeuxObtenue: data.listeJeuxObtenue,
      jeuxRecusPhysiquement: data.jeuxRecusPhysiquement,
      nbPrisesElectriques: data.nbPrisesElectriques,
      notesClient: data.notesClient,
      notesWorkflow: data.notesWorkflow
    });
  }

  /**
   * Charger les zones du plan pour le festival sélectionné
   */
  loadZonePlans(festivalId: number): void {
    const festival = this.festivalsList().find(f => f.id === festivalId);
    if (festival?.zonePlans) {
      this.zonePlansList.set(festival.zonePlans);
    } else {
      // Si le festival n'a pas encore les zones chargées, les charger via l'API
      this.festivalService.getFestivalById(festivalId).subscribe({
        next: (data) => {
          if (data.zonePlans) {
            this.zonePlansList.set(data.zonePlans);
          }
        },
        error: (err) => console.error('Erreur chargement zones du plan:', err)
      });
    }
  }

  /**
   * Mettre à jour la zone du plan pour un jeu
   */
  updateGameZonePlan(reservationJeuId: number, zonePlanId: number | null): void {
    if (!this.reservationId) return;
    
    const updateData = { zonePlanId: zonePlanId ?? undefined };
    
    this.reservationService.updateReservationJeu(this.reservationId, reservationJeuId, updateData).subscribe({
      next: (updatedJeu) => {
        console.log('Zone du plan mise à jour pour le jeu:', updatedJeu);
        // Mettre à jour le jeu dans la réservation locale
        const currentReservation = this.reservation();
        if (currentReservation?.reservationJeux) {
          const updatedJeux = currentReservation.reservationJeux.map(j => 
            j.id === reservationJeuId ? updatedJeu : j
          );
          this.reservation.set({ ...currentReservation, reservationJeux: updatedJeux });
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour zone du jeu:', err);
        this.error.set('Erreur lors de la mise à jour de la zone');
      }
    });
  }

  /**
   * Configurer l'auto-save
   */
  setupAutoSave(): void {
    this.reservationForm.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isEditMode && this.reservationId && this.reservationForm.valid && !this.saving()) {
          this.autoSave();
        }
      });
  }

  /**
   * Sauvegarde automatique
   */
  autoSave(): void {
    if (!this.reservationId) return;

    const formValue = this.reservationForm.value;
    const { editeurId, festivalId, ...autoSaveData } = formValue;

    this.reservationService.autoSaveReservation(this.reservationId, autoSaveData).subscribe({
      next: (updated) => {
        console.log('Auto-save réussi');
        this.reservation.set({ ...this.reservation()!, ...updated });
      },
      error: (err) => {
        console.error('Erreur auto-save:', err);
      }
    });
  }

  /**
   * Changer d'onglet
   */
  selectTab(tabId: number): void {
    this.currentTab.set(tabId);
  }

  /**
   * Sauvegarder la réservation
   */
  save(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.reservationForm.value;

    if (this.isEditMode && this.reservationId) {
      // Mise à jour - on retire éditeur et festival qui ne changent pas
      const { editeurId, festivalId, ...updateData } = formValue;
      
      this.reservationService.updateReservation(this.reservationId, updateData).subscribe({
        next: (res) => {
          console.log('✅ Update successful, redirecting to /reservations', res);
          this.saving.set(false);
          this.ngZone.run(() => {
            this.router.navigate(['/reservations']).then(success => {
              console.log('Navigation result:', success);
              if (!success) {
                 console.error('Navigation to /reservations failed!');
              }
            });
          });
        },
        error: (err) => {
          console.error('❌ Error during update:', err);
          const errorMessage = err.error?.message || err.message || 'Erreur inconnue';
          this.error.set(`Erreur lors de la mise à jour: ${err.status} - ${errorMessage}`);
          this.saving.set(false);
        }
      });
    } else {
      // Création
      this.reservationService.createReservation(formValue).subscribe({
        next: (created) => {
          this.saving.set(false);
          this.router.navigate(['/reservations']);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          if (err.status === 409) {
            this.error.set('Une réservation existe déjà pour cet éditeur et ce festival.');
          } else {
            this.error.set('Erreur lors de la création de la réservation');
          }
          this.saving.set(false);
        }
      });
    }
  }

  /**
   * Annuler et retourner à la liste
   */
  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.')) {
      this.router.navigate(['/reservations']);
    }
  }

  /**
   * Calculer le prix
   */
  calculatePrice(): void {
    if (!this.reservationId) return;
    this.priceLoading.set(true);

    this.reservationService.calculatePrice(this.reservationId).subscribe({
      next: (result) => {
        this.priceSummary.set(result);
        this.priceLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du calcul du prix:', err);
        this.error.set('Impossible de calculer la facture pour le moment');
        this.priceLoading.set(false);
      }
    });
  }

  /**
   * Calculer le prix (version corrigée)
   */
  calculatePriceOld(): void {
    if (!this.reservationId) return;

    this.reservationService.calculatePrice(this.reservationId).subscribe({
      next: (result) => {
        console.log('Calcul du prix:', result);
      },
      error: (err) => {
        console.error('Erreur lors du calcul du prix:', err);
      }
    });
  }

  /**
   * Obtenir le label d'un type de réservant
   */
  getTypeReservantLabel(type: TypeReservant): string {
    return TYPE_RESERVANT_LABELS[type] || type;
  }

  /**
   * Obtenir le label d'un statut de workflow
   */
  getWorkflowStatusLabel(status: WorkflowStatus): string {
    return WORKFLOW_STATUS_LABELS[status] || status;
  }

  /**
   * Safe access helpers for template
   */
  getReservationLineZoneName(line: any): string {
    return line?.zoneTarifaire?.nom || 'Zone #' + line?.zoneTarifaireId || '-';
  }

  getReservationJeuLibelle(rj: any): string {
    return rj?.jeu?.libelle || 'Jeu #' + rj?.jeuId || '-';
  }

  /**
   * Imprimer la réservation
   */
  printReservation(): void {
    window.print();
  }

  // ============ GESTION DES JEUX ============

  /**
   * Rechercher des jeux
   */
  /**
   * Rechercher des jeux
   */
  searchGames(query: string): void {
    this.gameSearchQuery.set(query);
    this.searchTerms.next(query);
  }

  /**
   * Ajouter un jeu à la réservation
   */
  addGameToReservation(jeu: Jeu): void {
    if (!this.reservationId) return;

    // Vérifier si le jeu est déjà dans la réservation
    const currentReservation = this.reservation();
    if (currentReservation?.reservationJeux?.some(rj => rj.jeuId === jeu.id)) {
      this.error.set('Ce jeu est déjà dans la réservation');
      return;
    }

    this.addingGameId.set(jeu.id);
    
    // Calculer le nombre de tables disponibles
    const totalTablesReservees = currentReservation?.reservationLines?.reduce((acc, line) => acc + line.nbTables, 0) || 0;
    const totalTablesAllouees = currentReservation?.reservationJeux?.reduce((acc, j) => acc + j.nbTablesAllouees, 0) || 0;
    
    // Si plus de place, erreur bloquante
    if (totalTablesAllouees >= totalTablesReservees) {
      this.error.set("Ajout impossible : toutes vos tables réservées sont déjà utilisées par d'autres jeux.");
      return;
    }

    this.reservationService.addReservationJeu(this.reservationId, {
      jeuId: jeu.id,
      nbExemplaires: 1, // Par défaut 1 exemplaire
      nbTablesAllouees: 1 // On essaye d'allouer 1 table par défaut
    }).subscribe({
      next: (reservationJeu: ReservationJeu) => {
        console.log('Jeu ajouté à la réservation:', reservationJeu);
        // Mettre à jour la réservation locale
        if (currentReservation) {
          // Manually attach the jeu object because the backend might not return the relation
          const newReservationJeu: any = { ...reservationJeu, jeu: jeu };
          const updatedJeux = [...(currentReservation.reservationJeux || []), newReservationJeu];
          this.reservation.set({ ...currentReservation, reservationJeux: updatedJeux });
        }
        // Effacer la recherche
        this.gameSearchQuery.set('');
        this.gameSearchResults.set([]);
        this.addingGameId.set(null);
      },
      error: (err: Error) => {
        console.error('Erreur ajout jeu:', err);
        this.error.set('Erreur lors de l\'ajout du jeu');
        this.addingGameId.set(null);
      }
    });
  }

  /**
   * Supprimer un jeu de la réservation
   */
  removeGameFromReservation(reservationJeuId: number): void {
    if (!this.reservationId) return;

    if (!confirm('Voulez-vous vraiment supprimer ce jeu de la réservation ?')) {
      return;
    }

    this.reservationService.deleteReservationJeu(this.reservationId, reservationJeuId).subscribe({
      next: () => {
        console.log('Jeu supprimé de la réservation');
        const currentReservation = this.reservation();
        if (currentReservation?.reservationJeux) {
          const updatedJeux = currentReservation.reservationJeux.filter(j => j.id !== reservationJeuId);
          this.reservation.set({ ...currentReservation, reservationJeux: updatedJeux });
        }
      },
      error: (err: Error) => {
        console.error('Erreur suppression jeu:', err);
        this.error.set('Erreur lors de la suppression du jeu');
      }
    });
  }

  /**
   * Afficher/masquer le formulaire de création de jeu
   */
  toggleNewGameForm(): void {
    this.showNewGameForm.set(!this.showNewGameForm());
    if (!this.showNewGameForm()) {
      this.newGameData.set({ libelle: '' });
    }
  }

  /**
   * Mettre à jour les données du nouveau jeu
   */
  updateNewGameField(field: keyof JeuCreateRequest, value: string | number | boolean): void {
    const currentData = this.newGameData();
    this.newGameData.set({ ...currentData, [field]: value });
  }

  /**
   * Créer un nouveau jeu et l'ajouter à la réservation
   */
  createAndAddGame(): void {
    const gameData = this.newGameData();
    
    if (!gameData.libelle || gameData.libelle.trim() === '') {
      this.error.set('Le nom du jeu est obligatoire');
      return;
    }

    this.savingGame.set(true);

    this.jeuService.createGame(gameData as JeuCreateRequest).subscribe({
      next: (jeu) => {
        console.log('Jeu créé:', jeu);
        this.savingGame.set(false);
        this.showNewGameForm.set(false);
        this.newGameData.set({ libelle: '' });
        
        // Ajouter directement le jeu à la réservation
        this.addGameToReservation(jeu);
      },
      error: (err) => {
        console.error('Erreur création jeu:', err);
        console.error('Détails erreur:', JSON.stringify(err, null, 2));
        const errorMessage = err?.error?.message || err?.message || 'Erreur lors de la création du jeu';
        this.error.set(errorMessage);
        this.savingGame.set(false);
      }
    });
  }

  /**
   * Mettre à jour le nombre d'exemplaires d'un jeu
   */
  updateGameQuantity(reservationJeuId: number, nbExemplaires: number): void {
    if (!this.reservationId || nbExemplaires < 1) return;

    this.reservationService.updateReservationJeu(this.reservationId, reservationJeuId, { nbExemplaires }).subscribe({
      next: (updatedJeu) => {
        console.log('Quantité mise à jour:', updatedJeu);
        const currentReservation = this.reservation();
        if (currentReservation?.reservationJeux) {
          const updatedJeux = currentReservation.reservationJeux.map(j => 
            j.id === reservationJeuId ? updatedJeu : j
          );
          this.reservation.set({ ...currentReservation, reservationJeux: updatedJeux });
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour quantité:', err);
        this.error.set('Erreur lors de la mise à jour');
      }
    });
  }

  /**
   * Mettre à jour le nombre de tables allouées pour un jeu
   */
  updateGameTables(reservationJeuId: number, nbTablesAllouees: number): void {
    if (!this.reservationId || nbTablesAllouees < 0) return;

    this.reservationService.updateReservationJeu(this.reservationId, reservationJeuId, { nbTablesAllouees }).subscribe({
      next: (updatedJeu) => {
        console.log('Tables mises à jour:', updatedJeu);
        const currentReservation = this.reservation();
        if (currentReservation?.reservationJeux) {
          const updatedJeux = currentReservation.reservationJeux.map(j => 
            j.id === reservationJeuId ? updatedJeu : j
          );
          this.reservation.set({ ...currentReservation, reservationJeux: updatedJeux });
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour tables:', err);
        this.error.set('Erreur lors de la mise à jour');
      }
    });
  }

  // ============ GESTION DES ESPACES (LIGNES) ============

  /**
   * Charger les zones tarifaires pour le festival sélectionné
   */
  loadZoneTarifaires(festivalId: number): void {
    const festival = this.festivalsList().find(f => f.id === festivalId);
    if (festival?.zoneTarifaires) {
      this.zoneTarifairesList.set(festival.zoneTarifaires);
    } else {
      this.festivalService.getFestivalById(festivalId).subscribe({
        next: (data) => {
          if (data.zoneTarifaires) {
            this.zoneTarifairesList.set(data.zoneTarifaires);
          }
        },
        error: (err) => console.error('Erreur chargement zones tarifaires:', err)
      });
    }
  }

  updateNewZoneField(field: 'nom' | 'prixTable' | 'prixM2', value: string | number): void {
    // Mark manual edit on m²
    if (field === 'prixM2') {
      this.newZoneM2Touched.set(true);
    }

    this.newZoneData.update(current => {
      const updated = { ...current, [field]: value } as any;
      // Auto-set m² price to table price / 4 when user hasn't edited m²
      if (field === 'prixTable' && !this.newZoneM2Touched()) {
        const prixTable = Number(value);
        updated.prixM2 = isNaN(prixTable) ? current.prixM2 : prixTable / 4;
      }
      return updated;
    });
  }

  toggleNewZoneForm(): void {
    const next = !this.showNewZoneForm();
    this.showNewZoneForm.set(next);
    if (!next) {
      this.newZoneM2Touched.set(false);
    }
  }

  createZoneTarifaire(): void {
    const festivalId = this.reservationForm.get('festivalId')?.value;
    if (!festivalId) {
      this.error.set('Sélectionnez un festival avant de créer une zone.');
      return;
    }

    const data = this.newZoneData();
    const prixTable = data.prixTable;
    const prixM2 = data.prixM2 !== undefined ? data.prixM2 : (prixTable !== undefined ? prixTable / 4 : undefined);

    if (!data.nom || prixTable === undefined || prixM2 === undefined) {
      this.error.set('Nom, prix table et prix m² sont obligatoires pour créer une zone.');
      return;
    }

    this.creatingZone.set(true);
    this.festivalService.addZoneTarifaire(festivalId, {
      nom: data.nom,
      prixTable: Number(prixTable),
      prixM2: Number(prixM2)
    }).subscribe({
      next: (zone) => {
        const zones = [...this.zoneTarifairesList(), zone];
        this.zoneTarifairesList.set(zones);
        this.newLineData.update(current => ({ ...current, zoneTarifaireId: zone.id }));
        this.newZoneData.set({});
        this.newZoneM2Touched.set(false);
        this.showNewZoneForm.set(false);
        this.creatingZone.set(false);
      },
      error: (err) => {
        console.error('Erreur création zone tarifaire:', err);
        this.error.set('Impossible de créer la zone tarifaire');
        this.creatingZone.set(false);
      }
    });
  }

  toggleNewZonePlanForm(): void {
    this.showNewZonePlanForm.update(v => !v);
  }

  updateNewZonePlanField(field: 'nom' | 'zoneTarifaireId', value: string | number | null): void {
    this.newZonePlanData.update(current => ({ ...current, [field]: value === '' ? undefined : value as any }));
  }

  createZonePlan(): void {
    const festivalId = this.reservationForm.get('festivalId')?.value;
    if (!festivalId) {
      this.error.set('Sélectionnez un festival avant de créer une zone du plan.');
      return;
    }

    const data = this.newZonePlanData();
    if (!data.nom) {
      this.error.set('Le nom de la zone du plan est obligatoire.');
      return;
    }

    this.creatingZonePlan.set(true);
    this.festivalService.addZonePlan(festivalId, {
      nom: data.nom,
      zoneTarifaireId: data.zoneTarifaireId || null
    }).subscribe({
      next: (zonePlan) => {
        const plans = [...this.zonePlansList(), zonePlan];
        this.zonePlansList.set(plans);
        this.newZonePlanData.set({});
        this.showNewZonePlanForm.set(false);
        this.creatingZonePlan.set(false);
      },
      error: (err) => {
        console.error('Erreur création zone du plan:', err);
        this.error.set('Impossible de créer la zone du plan');
        this.creatingZonePlan.set(false);
      }
    });
  }

  /**
   * Mettre à jour un champ du formulaire d'ajout de ligne
   */
  updateNewLineField(field: keyof CreateReservationLineRequest, value: number | boolean): void {
    const currentData = this.newLineData();
    this.newLineData.set({ ...currentData, [field]: value });
  }

  /**
   * Ajouter une ligne de réservation
   */
  addReservationLine(): void {
    if (!this.reservationId) return;
    
    const lineData = this.newLineData();
    if (!lineData.zoneTarifaireId) {
      this.error.set('Veuillez sélectionner une zone tarifaire');
      return;
    }

    this.addingLine.set(true);

    const createData: CreateReservationLineRequest = {
      zoneTarifaireId: lineData.zoneTarifaireId,
      nbTables: lineData.nbTables || 0,
      nbM2: lineData.nbM2 || 0,
      grandesTablesSouhaitees: lineData.grandesTablesSouhaitees || false
    };

    this.reservationService.addReservationLine(this.reservationId, createData).subscribe({
      next: (newLine) => {
        console.log('Ligne ajoutée:', newLine);
        const currentReservation = this.reservation();
        if (currentReservation) {
          const updatedLines = [...(currentReservation.reservationLines || []), newLine];
          this.reservation.set({ ...currentReservation, reservationLines: updatedLines });
        }
        // Réinitialiser le formulaire
        this.newLineData.set({});
        this.addingLine.set(false);
        this.calculatePrice();
      },
      error: (err) => {
        console.error('Erreur ajout ligne:', err);
        this.error.set('Erreur lors de l\'ajout de l\'espace');
        this.addingLine.set(false);
      }
    });
  }

  /**
   * Supprimer une ligne de réservation
   */
  removeReservationLine(lineId: number): void {
    if (!this.reservationId) return;

    if (!confirm('Voulez-vous vraiment supprimer cet espace ?')) {
      return;
    }

    this.reservationService.deleteReservationLine(this.reservationId, lineId).subscribe({
      next: () => {
        console.log('Ligne supprimée');
        const currentReservation = this.reservation();
        if (currentReservation?.reservationLines) {
          const updatedLines = currentReservation.reservationLines.filter(l => l.id !== lineId);
          this.reservation.set({ ...currentReservation, reservationLines: updatedLines });
        }
        this.calculatePrice();
      },
      error: (err) => {
        console.error('Erreur suppression ligne:', err);
        this.error.set('Erreur lors de la suppression de l\'espace');
      }
    });
  }

  // ========== CONTACTS ==========

  /**
   * Mettre à jour un champ du formulaire de contact
   */
  updateContactField(field: string, value: any): void {
    this.newContactData.update(current => ({ ...current, [field]: value }));
  }

  /**
   * Ajouter un contact à la réservation
   */
  addContact(): void {
    if (!this.reservationId) return;
    
    const data = this.newContactData();
    if (!data.dateContact) {
      this.error.set('La date de contact est obligatoire');
      return;
    }

    this.addingContact.set(true);
    this.error.set(null);

    this.reservationService.addReservationContact(this.reservationId, {
      dateContact: data.dateContact,
      commentaire: data.commentaire || ''
    }).subscribe({
      next: (newContact) => {
        console.log('Contact ajouté:', newContact);
        const currentReservation = this.reservation();
        if (currentReservation) {
          const updatedContacts = [...(currentReservation.reservationContacts || []), newContact];
          this.reservation.set({ ...currentReservation, reservationContacts: updatedContacts });
        }
        // Reset form
        this.newContactData.set({ dateContact: new Date().toISOString().split('T')[0] });
        this.addingContact.set(false);
      },
      error: (err) => {
        console.error('Erreur ajout contact:', err);
        console.error('Détails erreur:', JSON.stringify(err, null, 2));
        const errorMessage = err?.error?.message || err?.message || 'Erreur lors de l\'ajout du contact';
        this.error.set(errorMessage);
        this.addingContact.set(false);
      }
    });
  }

  /**
   * Supprimer un contact
   */
  removeContact(contactId: number): void {
    if (!this.reservationId) return;

    if (!confirm('Voulez-vous vraiment supprimer ce contact ?')) {
      return;
    }

    this.reservationService.deleteReservationContact(this.reservationId, contactId).subscribe({
      next: () => {
        console.log('Contact supprimé');
        const currentReservation = this.reservation();
        if (currentReservation?.reservationContacts) {
          const updatedContacts = currentReservation.reservationContacts.filter(c => c.id !== contactId);
          this.reservation.set({ ...currentReservation, reservationContacts: updatedContacts });
        }
      },
      error: (err) => {
        console.error('Erreur suppression contact:', err);
        this.error.set('Erreur lors de la suppression du contact');
      }
    });
  }
}
