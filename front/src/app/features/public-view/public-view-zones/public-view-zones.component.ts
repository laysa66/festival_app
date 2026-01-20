import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FestivalService } from '../../../core/services/festival.service';
import { FestivalSelectionService } from '../../../core/services/festival-selection.service';
import { ZoneTarifaire, ZonePlan } from '../../../core/models/festival';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

interface GameDisplay {
  id?: number;
  libelle: string;
  auteur?: string;
  theme?: string;
  ageMin?: number;
  description?: string;
}

@Component({
  selector: 'app-public-view-zones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    DatePipe,
    RouterModule,
    PublicNavbarComponent
  ],
  templateUrl: './public-view-zones.component.html',
  styleUrls: ['../public-view.component.css']
})
export class PublicViewZonesComponent implements OnInit {
  private festivalService = inject(FestivalService);
  private festivalSelectionService = inject(FestivalSelectionService);
  private activatedRoute = inject(ActivatedRoute);

  zoneTarifaires = signal<ZoneTarifaire[]>([]);
  zonePlans = signal<ZonePlan[]>([]);
  allGames = signal<GameDisplay[]>([]);
  
  // Maps to store games by zone
  gamesByZoneTarifaire = signal<Map<number, GameDisplay[]>>(new Map());
  gamesByZonePlan = signal<Map<number, GameDisplay[]>>(new Map());

  // View mode
  viewMode = signal<'tarifaire' | 'plan'>('tarifaire');

  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Detect which route we're on
    this.activatedRoute.url.subscribe(url => {
      // url[0].path will be either 'zones-tarifaires' or 'zones-plan'
      if (url[0]?.path === 'zones-plan') {
        this.viewMode.set('plan');
      } else if (url[0]?.path === 'zones-tarifaires') {
        this.viewMode.set('tarifaire');
      }
    });
    
    this.loadZoneData();
  }

  loadZoneData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    const selectedFestival = this.festivalSelectionService.getSelectedFestival();
    if (!selectedFestival) {
      this.error.set('No festival selected. Please select a festival first.');
      this.isLoading.set(false);
      return;
    }

    this.festivalService.getFestivalById(selectedFestival.id!).subscribe({
      next: (festival) => {
        if (festival.zoneTarifaires) {
          this.zoneTarifaires.set(festival.zoneTarifaires);
        }
        if (festival.zonePlans) {
          this.zonePlans.set(festival.zonePlans);
        }
        
        // Load all games
        this.loadAllGames();
      },
      error: (err) => {
        console.error('Error loading festival details:', err);
        this.error.set('Failed to load zone data.');
        this.isLoading.set(false);
      }
    });
  }

  loadAllGames(): void {
    this.festivalService.getAllGames().subscribe({
      next: (games) => {
        this.allGames.set(games);
        this.loadGamesForZones();
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.allGames.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadGamesForZones(): void {
    // Show all games for each zone
    // (Game-to-zone assignment could be implemented later in backend)
    const zoneTarMap = new Map<number, GameDisplay[]>();
    this.zoneTarifaires().forEach(zone => {
      zoneTarMap.set(zone.id, this.allGames());
    });
    this.gamesByZoneTarifaire.set(zoneTarMap);

    const zonePlanMap = new Map<number, GameDisplay[]>();
    this.zonePlans().forEach(zone => {
      zonePlanMap.set(zone.id, this.allGames());
    });
    this.gamesByZonePlan.set(zonePlanMap);
    this.isLoading.set(false);
  }

  getGamesForZoneTarifaire(zoneId: number): GameDisplay[] {
    return this.gamesByZoneTarifaire().get(zoneId) || [];
  }

  getGamesForZonePlan(zoneId: number): GameDisplay[] {
    return this.gamesByZonePlan().get(zoneId) || [];
  }
}
