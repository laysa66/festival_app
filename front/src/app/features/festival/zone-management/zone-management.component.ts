import { Component, input, signal, effect } from '@angular/core';
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
  ],
  templateUrl: './zone-management.component.html',
  styleUrl: './zone-management.component.css',
})
export class ZoneManagementComponent {
  festival = input<Festival | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  newZoneForm!: FormGroup;
  zones = signal<ZoneTarifaire[]>([]);

  displayedColumns: string[] = ['nom', 'prixTable', 'prixM2', 'actions'];

  constructor(
    private fb: FormBuilder,
    private festivalService: FestivalService,
    private dialog: MatDialog
  ) {
    this.initializeForm();

    // Watch for festival changes
    effect(() => {
      const festival = this.festival();
      if (festival?.zonesT) {
        this.zones.set(festival.zonesT);
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
    if (!this.isEditing()) {
      this.newZoneForm.reset();
    }
  }

  addZone(): void {
    if (this.newZoneForm.valid && this.festival()) {
      this.isLoading.set(true);
      const formValue = this.newZoneForm.value;
      
      this.festivalService.addZoneTarifaire(this.festival()!.id, formValue).subscribe({
        next: (newZone) => {
          // Update zones list
          this.zones.set([...this.zones(), newZone]);
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
  }

  deleteZone(zoneId: number): void {
    if (confirm('Are you sure you want to delete this zone?')) {
      this.isLoading.set(true);
      
      this.festivalService.deleteZoneTarifaire(zoneId).subscribe({
        next: () => {
          // Remove from local list
          this.zones.set(this.zones().filter(z => z.id !== zoneId));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error deleting zone:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  editZone(zone: ZoneTarifaire): void {
    console.log('Editing zone:', zone);
    // TODO: Open edit dialog in future implementation
  }
}
