import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface GameFormData {
  id?: number;
  libelle: string;
  auteur?: string;
  nbMinJoueur?: number;
  nbMaxJoueur?: number;
  duree?: number;
  image?: string;
  idEditeur?: number;
  idTypeJeu?: number;
  ageMin?: number;
  theme?: string;
  description?: string;
}

export interface DialogData {
  game?: GameFormData;
  gameTypes: any[];
  editeurs: any[];
}

@Component({
  selector: 'app-game-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './game-form-dialog.component.html',
  styleUrls: ['./game-form-dialog.component.css'],
})
export class GameFormDialogComponent {
  private fb = inject(FormBuilder);
  gameForm: FormGroup;
  isEditMode = false;
  gameTypes: any[];
  editeurs: any[];

  constructor(
    private dialogRef: MatDialogRef<GameFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.gameTypes = data.gameTypes || [];
    this.editeurs = data.editeurs || [];
    this.isEditMode = !!data.game;

    this.gameForm = this.fb.group({
      libelle: [data.game?.libelle || '', Validators.required],
      auteur: [data.game?.auteur || ''],
      nbMinJoueur: [data.game?.nbMinJoueur || null],
      nbMaxJoueur: [data.game?.nbMaxJoueur || null],
      duree: [data.game?.duree || null],
      image: [data.game?.image || ''],
      idEditeur: [data.game?.idEditeur || null],
      idTypeJeu: [data.game?.idTypeJeu || null],
      ageMin: [data.game?.ageMin || null],
      theme: [data.game?.theme || ''],
      description: [data.game?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      const formValue = this.gameForm.value;
      // Convert string values to numbers where needed
      const gameData = {
        ...formValue,
        nbMinJoueur: formValue.nbMinJoueur ? parseInt(formValue.nbMinJoueur, 10) : null,
        nbMaxJoueur: formValue.nbMaxJoueur ? parseInt(formValue.nbMaxJoueur, 10) : null,
        duree: formValue.duree ? parseInt(formValue.duree, 10) : null,
        ageMin: formValue.ageMin ? parseInt(formValue.ageMin, 10) : null,
        idEditeur: formValue.idEditeur ? parseInt(formValue.idEditeur, 10) : null,
        idTypeJeu: formValue.idTypeJeu ? parseInt(formValue.idTypeJeu, 10) : null,
      };
      this.dialogRef.close(gameData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isEditMode ? 'Modifier le jeu' : 'Ajouter un nouveau jeu';
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? 'Modifier' : 'Ajouter';
  }
}
