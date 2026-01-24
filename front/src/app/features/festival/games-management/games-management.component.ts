import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { FestivalService } from '../../../core/services/festival.service';
import { GameFormDialogComponent } from '../game-form-dialog/game-form-dialog.component';

interface GameDisplay {
  id: number;
  libelle: string;
  auteur?: string;
  image?: string;
  editeur?: {
    libelle: string;
  };
  nbMinJoueur?: number;
  nbMaxJoueur?: number;
  duree?: number;
  typeJeu?: {
    id: number;
    libelle: string;
  };
}

interface GameType {
  id: number;
  libelle: string;
}

@Component({
  selector: 'app-games-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSliderModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './games-management.component.html',
  styleUrls: ['./games-management.component.css']
})
export class GamesManagementComponent implements OnInit {
  private festivalService = inject(FestivalService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  games = signal<GameDisplay[]>([]);
  filteredGames = signal<GameDisplay[]>([]);
  dataSource = signal<MatTableDataSource<GameDisplay>>(new MatTableDataSource<GameDisplay>([]));
  isLoading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  
  // Filter signals
  selectedType = signal<number | null>(null);
  minDuration = signal(0);
  maxDuration = signal(120);
  minPlayers = signal(1);
  maxPlayers = signal(8);
  gameTypes = signal<GameType[]>([]);
  
  displayedColumns: string[] = ['libelle', 'image', 'auteur', 'editeur', 'joueurs', 'duree', 'typeJeu', 'actions'];
  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.festivalService.getAllGames().subscribe({
      next: (games: any) => {
        const gamesList: GameDisplay[] = Array.isArray(games) ? games : (games as any).games || games;
        this.games.set(gamesList);
        this.extractGameTypes(gamesList);
        this.filteredGames.set(gamesList);
        this.updateDataSource(gamesList);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading games:', err);
        this.error.set('Failed to load games from database');
        this.isLoading.set(false);
      }
    });
  }

  extractGameTypes(games: GameDisplay[]): void {
    const typesMap = new Map<number, GameType>();
    games.forEach(game => {
      if (game.typeJeu && !typesMap.has(game.typeJeu.id)) {
        typesMap.set(game.typeJeu.id, { id: game.typeJeu.id, libelle: game.typeJeu.libelle });
      }
    });
    this.gameTypes.set(Array.from(typesMap.values()).sort((a, b) => a.libelle.localeCompare(b.libelle)));
  }

  updateDataSource(games: GameDisplay[]): void {
    const dataSource = new MatTableDataSource(games);
    this.dataSource.set(dataSource);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.toLowerCase());
    this.applyFilters();
  }

  applyFilters(): void {
    const searchTerm = this.searchTerm().toLowerCase();
    const selectedType = this.selectedType();
    const minDuration = this.minDuration();
    const maxDuration = this.maxDuration();
    const minPlayers = this.minPlayers();
    const maxPlayers = this.maxPlayers();

    let filtered = this.games().filter(game => {
      // Search filter
      if (searchTerm) {
        const matchesSearch = 
          game.libelle.toLowerCase().includes(searchTerm) ||
          (game.auteur && game.auteur.toLowerCase().includes(searchTerm)) ||
          (game.editeur?.libelle && game.editeur.libelle.toLowerCase().includes(searchTerm)) ||
          (game.typeJeu?.libelle && game.typeJeu.libelle.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedType && game.typeJeu?.id !== selectedType) {
        return false;
      }

      // Duration filter
      const gameDuration = game.duree || 0;
      if (gameDuration < minDuration || gameDuration > maxDuration) {
        return false;
      }

      // Players filter
      const gameMinPlayers = game.nbMinJoueur || 0;
      const gameMaxPlayers = game.nbMaxJoueur || 0;
      
      // Check if the game's player range overlaps with the filter range
      if (gameMaxPlayers > 0 && (gameMaxPlayers < minPlayers || gameMinPlayers > maxPlayers)) {
        return false;
      }

      return true;
    });

    this.filteredGames.set(filtered);
    this.updateDataSource(filtered);
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onDurationChange(): void {
    this.applyFilters();
  }

  onPlayersChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set(null);
    this.minDuration.set(0);
    this.maxDuration.set(120);
    this.minPlayers.set(1);
    this.maxPlayers.set(8);
    this.filteredGames.set(this.games());
    this.updateDataSource(this.games());
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return 'assets/placeholder-game.png';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:3000${imagePath}`;
  }

  getPlayersRange(minPlayers?: number, maxPlayers?: number): string {
    if (!minPlayers && !maxPlayers) {
      return '-';
    }
    return `${minPlayers || '-'} - ${maxPlayers || '?'}`;
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.applyFilters();
  }

  // CRUD Methods

  openAddGameDialog(): void {
    const dialogRef = this.dialog.open(GameFormDialogComponent, {
      width: '500px',
      data: {
        gameTypes: this.gameTypes(),
        editeurs: [], // You can populate this from backend if needed
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createGame(result);
      }
    });
  }

  openEditGameDialog(game: GameDisplay): void {
    const dialogRef = this.dialog.open(GameFormDialogComponent, {
      width: '500px',
      data: {
        game,
        gameTypes: this.gameTypes(),
        editeurs: [],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateGame(game.id, result);
      }
    });
  }

  openDeleteConfirmation(game: GameDisplay): void {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le jeu "${game.libelle}" ?`
    );
    if (confirmed) {
      this.deleteGame(game.id);
    }
  }

  createGame(gameData: any): void {
    this.festivalService.createGame(gameData).subscribe({
      next: (newGame: any) => {
        const updatedGames = [...this.games(), newGame];
        this.games.set(updatedGames);
        this.applyFilters();
        this.snackBar.open(`Jeu "${newGame.libelle}" créé avec succès`, 'Fermer', {
          duration: 3000,
        });
      },
      error: (err: any) => {
        console.error('Error creating game:', err);
        this.snackBar.open('Erreur lors de la création du jeu', 'Fermer', {
          duration: 3000,
        });
      },
    });
  }

  updateGame(id: number, gameData: any): void {
    this.festivalService.updateGame(id, gameData).subscribe({
      next: (updatedGame: any) => {
        const updatedGames = this.games().map((g) =>
          g.id === id ? updatedGame : g
        );
        this.games.set(updatedGames);
        this.applyFilters();
        this.snackBar.open(`Jeu "${updatedGame.libelle}" modifié avec succès`, 'Fermer', {
          duration: 3000,
        });
      },
      error: (err: any) => {
        console.error('Error updating game:', err);
        this.snackBar.open('Erreur lors de la modification du jeu', 'Fermer', {
          duration: 3000,
        });
      },
    });
  }

  deleteGame(id: number): void {
    const gameName = this.games().find((g) => g.id === id)?.libelle || 'le jeu';
    this.festivalService.deleteGame(id).subscribe({
      next: () => {
        const updatedGames = this.games().filter((g) => g.id !== id);
        this.games.set(updatedGames);
        this.applyFilters();
        this.snackBar.open(`Jeu "${gameName}" supprimé avec succès`, 'Fermer', {
          duration: 3000,
        });
      },
      error: (err: any) => {
        console.error('Error deleting game:', err);
        this.snackBar.open('Erreur lors de la suppression du jeu', 'Fermer', {
          duration: 3000,
        });
      },
    });
  }
}
