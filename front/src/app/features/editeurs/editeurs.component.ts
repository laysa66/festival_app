import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../core/services/auth.service';
import { EditeursService, Editeur } from '../../core/services/editeurs.service';
import { EditeurDialogComponent } from './editeur-dialog/editeur-dialog.component';
import { DeleteConfirmDialogComponent } from '../../shared/delete-confirm-dialog';

@Component({
  selector: 'app-editeurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './editeurs.component.html',
  styleUrls: ['./editeurs.component.scss']
})
export class EditeursComponent implements OnInit {
  private authService = inject(AuthService);
  private editeursService = inject(EditeursService);
  private dialog = inject(MatDialog);

  currentUser = signal(this.authService.getCurrentUser());
  editeurs = signal<Editeur[]>([]);
  dataSource = signal<MatTableDataSource<Editeur>>(new MatTableDataSource<Editeur>([]));
  isLoading = signal(false);
  errorMessage = signal('');
  displayedColumns: string[] = ['libelle', 'type', 'logo', 'contact', 'notes', 'actions'];

  // Filter signals
  searchTerm = signal('');
  filterExposant = signal(false);
  filterDistributeur = signal(false);

  ngOnInit() {
    this.loadEditeurs();
  }

  applyFilters() {
    const search = this.searchTerm().toLowerCase();
    const exposantFilter = this.filterExposant();
    const distributeurFilter = this.filterDistributeur();

    let filtered = this.editeurs();

    // Apply search filter
    if (search) {
      filtered = filtered.filter(e =>
        e.libelle.toLowerCase().includes(search) ||
        e.phone?.toLowerCase().includes(search) ||
        e.email?.toLowerCase().includes(search)
      );
    }

    // Apply type filters
    if (exposantFilter || distributeurFilter) {
      filtered = filtered.filter(e => {
        if (exposantFilter && distributeurFilter) {
          return e.exposant || e.distributeur;
        } else if (exposantFilter) {
          return e.exposant;
        } else {
          return e.distributeur;
        }
      });
    }

    this.dataSource.set(new MatTableDataSource<Editeur>(filtered));
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  loadEditeurs() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.editeursService.getEditeurs().subscribe({
      next: (data) => {
        this.editeurs.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erreur lors du chargement des éditeurs');
        this.isLoading.set(false);
      }
    });
  }

  getEditorType(editeur: Editeur): string {
    if (editeur.exposant && editeur.distributeur) return 'Exposant & Distributeur';
    if (editeur.exposant) return 'Exposant';
    if (editeur.distributeur) return 'Distributeur';
    return 'Non défini';
  }

  updateContact(editeur: Editeur, field: 'phone' | 'email', value: string) {
    const updatedEditeur = { ...editeur, [field]: value };
    this.editeursService.updateEditeur(editeur.id, { [field]: value }).subscribe({
      next: () => {
        const index = this.editeurs().findIndex(e => e.id === editeur.id);
        if (index !== -1) {
          const updated = [...this.editeurs()];
          updated[index] = updatedEditeur;
          this.editeurs.set(updated);
          this.dataSource.set(new MatTableDataSource<Editeur>(updated));
        }
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la mise à jour');
      }
    });
  }

  updateNotes(editeur: Editeur, value: string) {
    const updatedEditeur = { ...editeur, notes: value };
    this.editeursService.updateEditeur(editeur.id, { notes: value }).subscribe({
      next: () => {
        const index = this.editeurs().findIndex(e => e.id === editeur.id);
        if (index !== -1) {
          const updated = [...this.editeurs()];
          updated[index] = updatedEditeur;
          this.editeurs.set(updated);
          this.dataSource.set(new MatTableDataSource<Editeur>(updated));
        }
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la mise à jour');
      }
    });
  }

  openEditDialog(editeur: Editeur) {
    const dialogRef = this.dialog.open(EditeurDialogComponent, {
      width: '500px',
      data: { editeur: { ...editeur } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editeursService.updateEditeur(editeur.id, result).subscribe({
          next: () => {
            this.loadEditeurs();
          },
          error: () => {
            this.errorMessage.set('Erreur lors de la mise à jour');
          }
        });
      }
    });
  }

  openDeleteDialog(editeur: Editeur) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer un éditeur',
        message: `Êtes-vous sûr de vouloir supprimer "${editeur.libelle}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editeursService.deleteEditeur(editeur.id).subscribe({
          next: () => {
            this.loadEditeurs();
          },
          error: () => {
            this.errorMessage.set('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(EditeurDialogComponent, {
      width: '500px',
      data: { isCreating: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editeursService.createEditeur(result).subscribe({
          next: () => {
            this.loadEditeurs();
          },
          error: () => {
            this.errorMessage.set('Erreur lors de la création');
          }
        });
      }
    });
  }
}