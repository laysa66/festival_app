import { Injectable, signal } from '@angular/core';
import { Festival } from '../models/festival';

@Injectable({
  providedIn: 'root',
})
export class FestivalSelectionService {
  selectedFestival = signal<Festival | null>(null);

  setSelectedFestival(festival: Festival | null): void {
    this.selectedFestival.set(festival);
  }

  getSelectedFestival(): Festival | null {
    return this.selectedFestival();
  }

  clearSelectedFestival(): void {
    this.selectedFestival.set(null);
  }
}
