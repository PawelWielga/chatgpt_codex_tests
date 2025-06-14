import { Component } from '@angular/core';

import { GameCardComponent } from '../shared/game-card/game-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [GameCardComponent]
})
export class HomeComponent {
  currentYear: number = new Date().getFullYear();
}
