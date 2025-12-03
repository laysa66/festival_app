import { Component, input, output } from '@angular/core';
import { Festival } from '../../../core/models/festival';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-festival-card',
  imports: [MatCard],
  templateUrl: './festival-card.component.html',
  styleUrl: './festival-card.component.css',
})
export class FestivalCardComponent {

  public festival: any = input<Festival>()

  //delete button (output signal)
  remove = output<number>()

  //delete festival funtion
  public onDelete(id: number){
    this.remove.emit(id)
  }

}
