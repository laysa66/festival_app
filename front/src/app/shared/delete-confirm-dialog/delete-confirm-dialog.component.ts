import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog">
      <div class="icon-container">
        <mat-icon class="warning-icon">warning</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Supprimer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog {
      text-align: center;
    }

    .icon-container {
      margin: 20px 0;
    }

    .warning-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }

    h2 {
      color: #333;
      margin: 16px 0;
    }

    mat-dialog-content {
      color: #666;
      margin: 20px 0;
    }

    mat-dialog-actions {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class DeleteConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { title: string; message: string };

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
