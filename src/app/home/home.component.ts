import { Component } from '@angular/core';

import { HomeTileComponent } from '../shared/home-tile/home-tile.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [HomeTileComponent, NavbarComponent, FooterComponent]
})
export class HomeComponent {}
