import { Component, output, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Festival } from '../../../core/models/festival';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-festival-card',
  imports: [CommonModule, MatCardModule, MatIcon, DatePipe],
  templateUrl: './festival-card.component.html',
  styleUrl: './festival-card.component.css',
})
export class FestivalCardComponent {
  public festival: any = input<Festival>()

  //delete button (output signal)
  remove = output<number>()
  
  //edit button (output signal)
  edit = output<Festival>()

  //delete festival function
  deleteFestival(id:number) {
    this.remove.emit(id);
  }
  
  //edit festival function
  editFestival(festival: Festival) {
    this.edit.emit(festival);
  }

}
