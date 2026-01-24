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
    const zoneTarMap = new Map<number, GameDisplay[]>();
    const zonePlanMap = new Map<number, GameDisplay[]>();

    const totalRequests = this.zoneTarifaires().length + this.zonePlans().length;
    let completed = 0;

    const markDone = () => {
      completed += 1;
      if (completed >= totalRequests) {
        this.isLoading.set(false);
      }
    };

    this.zoneTarifaires().forEach(zone => {
      this.festivalService.getGamesByZoneTarifaire(zone.id).subscribe({
        next: (games) => {
          zoneTarMap.set(zone.id, games);
          this.gamesByZoneTarifaire.set(new Map(zoneTarMap));
          markDone();
        },
        error: () => {
          zoneTarMap.set(zone.id, []);
          this.gamesByZoneTarifaire.set(new Map(zoneTarMap));
          markDone();
        }
      });
    });

    this.zonePlans().forEach(zone => {
      this.festivalService.getGamesByZonePlan(zone.id).subscribe({
        next: (games) => {
          zonePlanMap.set(zone.id, games);
          this.gamesByZonePlan.set(new Map(zonePlanMap));
          markDone();
        },
        error: () => {
          zonePlanMap.set(zone.id, []);
          this.gamesByZonePlan.set(new Map(zonePlanMap));
          markDone();
        }
      });
    });
  }

  getGamesForZoneTarifaire(zoneId: number): GameDisplay[] {
    return this.gamesByZoneTarifaire().get(zoneId) || [];
  }

  getGamesForZonePlan(zoneId: number): GameDisplay[] {
    return this.gamesByZonePlan().get(zoneId) || [];
  }
}
