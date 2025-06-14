import { Component } from '@angular/core';

import { HomeTileComponent } from '../shared/home-tile/home-tile.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [HomeTileComponent]
})
export class HomeComponent {
  currentYear: number = new Date().getFullYear();
}
