import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Festival, ZoneTarifaire } from '../../../core/models/festival';
import { FestivalService, ZonePlan } from '../../../core/services/festival.service';

@Component({
  selector: 'app-zone-plan-management',
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
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './zone-plan-management.component.html',
  styleUrl: './zone-plan-management.component.css',
})
export class ZonePlanManagementComponent {
  festival = input<Festival | null>(null);
  isEditing = signal(false);
  editingZonePlanId = signal<number | null>(null);
  isLoading = signal(false);
  newZonePlanForm!: FormGroup;
  editZonePlanForm!: FormGroup;
  zonePlans = signal<ZonePlan[]>([]);
  availableZones = signal<ZoneTarifaire[]>([]);

  displayedColumns: string[] = ['nom', 'linkedZone', 'actions'];

  constructor(
    private fb: FormBuilder,
    private festivalService: FestivalService
  ) {
    this.initializeForm();

    // Watch for festival changes
    effect(() => {
      const festival = this.festival();
      if (festival?.zonePlans) {
        this.zonePlans.set(festival.zonePlans);
      }
      if (festival?.zoneTarifaires) {
        this.availableZones.set(festival.zoneTarifaires);
      }
    });
  }

  initializeForm(): void {
    this.newZonePlanForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      zoneTarifaireId: ['', Validators.required],
    });

    this.editZonePlanForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      zoneTarifaireId: ['', Validators.required],
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      this.newZonePlanForm.reset();
    }
  }

  addZonePlan(): void {
    if (this.newZonePlanForm.valid && this.festival()) {
      this.isLoading.set(true);
      const formValue = this.newZonePlanForm.value;
      
      this.festivalService.addZonePlan(this.festival()!.id, formValue).subscribe({
        next: (newZonePlan) => {
          // Update zone plans list
          this.zonePlans.set([...this.zonePlans(), newZonePlan]);
          this.newZonePlanForm.reset();
          this.isEditing.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding zone plan:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  editZonePlan(zonePlan: ZonePlan): void {
    this.editingZonePlanId.set(zonePlan.id);
    this.editZonePlanForm.patchValue({
      nom: zonePlan.nom,
      zoneTarifaireId: zonePlan.zoneTarifaireId,
    });
  }

  updateZonePlan(): void {
    if (this.editZonePlanForm.valid && this.editingZonePlanId()) {
      this.isLoading.set(true);
      const formValue = this.editZonePlanForm.value;

      this.festivalService.updateZonePlan(this.editingZonePlanId()!, formValue).subscribe({
        next: (updatedZonePlan) => {
          // Update in local list
          const updatedList = this.zonePlans().map((z) =>
            z.id === updatedZonePlan.id ? updatedZonePlan : z
          );
          this.zonePlans.set(updatedList);
          this.cancelEdit();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error updating zone plan:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingZonePlanId.set(null);
    this.editZonePlanForm.reset();
  }

  deleteZonePlan(zonePlanId: number): void {
    if (confirm('Are you sure you want to delete this zone plan?')) {
      this.isLoading.set(true);
      
      this.festivalService.deleteZonePlan(zonePlanId).subscribe({
        next: () => {
          // Remove from local list
          this.zonePlans.set(this.zonePlans().filter(z => z.id !== zonePlanId));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error deleting zone plan:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  getZoneNameById(zoneId: number): string {
    const zone = this.availableZones().find(z => z.id === zoneId);
    return zone?.nom || 'N/A';
  }
}
