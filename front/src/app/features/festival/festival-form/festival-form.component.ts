import { Component, Inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FestivalService } from '../../../core/services/festival.service';
import { Festival } from '../../../core/models/festival';

@Component({
  selector: 'app-festival-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './festival-form.component.html',
  styleUrl: './festival-form.component.css',
})
export class FestivalFormComponent {
  festivalForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private festivalService: FestivalService,
    public dialogRef: MatDialogRef<FestivalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Festival | null
  ) {
    this.initializeForm();
    
    effect(() => {
      if (this.data) {
        this.festivalForm.patchValue(this.data);
      }
    });
  }

  initializeForm(): void {
    this.festivalForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      lieu: ['', [Validators.required, Validators.minLength(3)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      nbTotalTable: ['', [Validators.required, Validators.min(0)]],
      nbTotalChaise: ['', [Validators.required, Validators.min(0)]],
      bigTables: [0, [Validators.required, Validators.min(0)]],
      bigChairs: [0, [Validators.required, Validators.min(0)]],
      smallTables: [0, [Validators.required, Validators.min(0)]],
      smallChairs: [0, [Validators.required, Validators.min(0)]],
      mairieTables: [0, [Validators.required, Validators.min(0)]],
      mairieChairs: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('Form valid:', this.festivalForm.valid);
    console.log('Form value:', this.festivalForm.value);
    
    if (this.festivalForm.valid) {
      this.isLoading = true;
      const formValue = this.festivalForm.value;

      // Convert dates to ISO string format
      if (formValue.dateDebut instanceof Date) {
        formValue.dateDebut = formValue.dateDebut.toISOString();
      }
      if (formValue.dateFin instanceof Date) {
        formValue.dateFin = formValue.dateFin.toISOString();
      }

      console.log('Submitting festival data:', formValue);

      const operation = this.data
        ? this.festivalService.updateFestival(this.data.id, formValue)
        : this.festivalService.createFestival(formValue);

      operation.subscribe({
        next: (result) => {
          console.log('Festival created/updated successfully:', result);
          this.isLoading = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error saving festival:', error);
          this.isLoading = false;
          alert('Error saving festival: ' + (error?.error?.message || error?.message || 'Unknown error'));
        },
      });
    } else {
      console.log('Form is invalid');
      alert('Please fill out all required fields correctly');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.festivalForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least 3 characters`;
    }
    if (field?.hasError('min')) {
      return `${fieldName} must be a positive number`;
    }
    return '';
  }
}
