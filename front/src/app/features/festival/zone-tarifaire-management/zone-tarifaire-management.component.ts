import { Component, input, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Festival } from '../../../core/models/festival';
import { FestivalService, ZoneTarifaire } from '../../../core/services/festival.service';

@Component({
  selector: 'app-zone-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './zone-tarifaire-management.component.html',
  styleUrl: './zone-tarifaire-management.component.css',
})
export class ZoneTarifaireManagementComponent {
  festival = input<Festival | null>(null);
  isEditing = signal(false);
  isEditingZoneId = signal<number | null>(null);
  isLoading = signal(false);
  newZoneForm!: FormGroup;
  zones = signal<ZoneTarifaire[]>([]);
  zonesChanged = output<ZoneTarifaire[]>();

  displayedColumns: string[] = ['nom', 'prixTable', 'prixM2', 'actions'];

  constructor(
    private fb: FormBuilder,
    private festivalService: FestivalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();

    // Watch for festival changes
    effect(() => {
      const festival = this.festival();
      if (festival?.zoneTarifaires) {
        this.zones.set(festival.zoneTarifaires);
      }
    });
  }

  initializeForm(): void {
    this.newZoneForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prixTable: [0, [Validators.required, Validators.min(0)]],
      prixM2: [0, [Validators.required, Validators.min(0)]],
    });

    // Auto-calculate prixM2 when prixTable changes
    this.newZoneForm.get('prixTable')?.valueChanges.subscribe((value) => {
      if (value && value > 0) {
        this.newZoneForm.patchValue({
          prixM2: value / 4,
        }, { emitEvent: false });
      }
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    this.isEditingZoneId.set(null);
    if (!this.isEditing()) {
      this.newZoneForm.reset();
    }
  }

  addZone(): void {
    if (this.newZoneForm.valid && this.festival()) {
      const isEditing = this.isEditingZoneId() !== null;
      
      if (isEditing) {
        this.updateZone();
      } else {
        this.createZone();
      }
    }
  }

  createZone(): void {
    if (!this.festival()) return;
    
    this.isLoading.set(true);
    const formValue = this.newZoneForm.value;
    
    this.festivalService.addZoneTarifaire(this.festival()!.id, formValue).subscribe({
      next: (newZone) => {
        // Update zones list
        const updatedZones = [...this.zones(), newZone];
        this.zones.set(updatedZones);
        this.zonesChanged.emit(updatedZones);
        this.newZoneForm.reset();
        this.isEditing.set(false);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error adding zone:', err);
        this.isLoading.set(false);
      },
    });
  }

  updateZone(): void {
    const zoneId = this.isEditingZoneId();
    if (!zoneId) return;

    this.isLoading.set(true);
    const formValue = this.newZoneForm.value;
    
    this.festivalService.updateZoneTarifaire(zoneId, formValue).subscribe({
      next: (updatedZone) => {
        // Update zones list
        const updatedZones = this.zones().map(z => z.id === zoneId ? updatedZone : z);
        this.zones.set(updatedZones);
        this.zonesChanged.emit(updatedZones);
        this.newZoneForm.reset();
        this.isEditing.set(false);
        this.isEditingZoneId.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error updating zone:', err);
        this.isLoading.set(false);
      },
    });
  }

  editZone(zone: ZoneTarifaire): void {
    this.isEditingZoneId.set(zone.id);
    this.isEditing.set(true);
    this.newZoneForm.patchValue({
      nom: zone.nom,
      prixTable: zone.prixTable,
      prixM2: zone.prixM2,
    });
  }

  cancelEdit(): void {
    this.isEditingZoneId.set(null);
    this.isEditing.set(false);
    this.newZoneForm.reset();
  }

  deleteZone(zoneId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette zone tarifaire ?')) {
      this.isLoading.set(true);
      
      this.festivalService.deleteZoneTarifaire(zoneId).subscribe({
        next: () => {
          // Remove from local list
          const updatedZones = this.zones().filter(z => z.id !== zoneId);
          this.zones.set(updatedZones);
          this.zonesChanged.emit(updatedZones);
          this.isLoading.set(false);
          this.snackBar.open('Zone tarifaire supprimée avec succès', 'Fermer', {
            duration: 3000,
          });
        },
        error: (err) => {
          console.error('Error deleting zone:', err);
          this.isLoading.set(false);
          
          // Check for specific error messages
          let errorMessage = 'Erreur lors de la suppression de la zone tarifaire';
          if (err?.error?.message) {
            if (err.error.message.includes('used in existing reservations')) {
              errorMessage = 'Impossible de supprimer cette zone : elle est utilisée dans des réservations existantes';
            } else if (err.error.message.includes('linked to') && err.error.message.includes('zone plan')) {
              errorMessage = 'Impossible de supprimer cette zone : elle est liée à des zones du plan. Veuillez d\'abord supprimer les zones du plan.';
            } else if (err.error.message.includes('referenced by other records')) {
              errorMessage = 'Impossible de supprimer cette zone : elle est liée à d\'autres enregistrements';
            } else {
              errorMessage = err.error.message;
            }
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
