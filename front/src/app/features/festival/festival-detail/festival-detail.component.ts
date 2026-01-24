import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Festival } from '../../../core/models/festival';

@Component({
  selector: 'app-festival-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    DatePipe,
  ],
  templateUrl: './festival-detail.component.html',
  styleUrl: './festival-detail.component.css',
})
export class FestivalDetailComponent {
  festival = input<Festival | null>(null);
}
