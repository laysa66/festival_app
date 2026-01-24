import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Editeur } from '../../../core/services/editeurs.service';

@Component({
  selector: 'app-editeur-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './editeur-dialog.component.html',
  styleUrl: './editeur-dialog.component.css'
})
export class EditeurDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditeurDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as { editeur?: Editeur; isCreating?: boolean };

  form!: FormGroup;
  isCreating = signal(this.data?.isCreating ?? false);

  ngOnInit() {
    const editeur = this.data?.editeur;
    this.form = this.fb.group({
      libelle: [editeur?.libelle || '', Validators.required],
      phone: [editeur?.phone || ''],
      email: [editeur?.email || '', [Validators.email]],
      notes: [editeur?.notes || ''],
      exposant: [editeur?.exposant || false],
      distributeur: [editeur?.distributeur || false]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
