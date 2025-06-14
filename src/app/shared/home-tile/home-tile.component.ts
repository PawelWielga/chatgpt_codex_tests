import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-tile',
  templateUrl: './home-tile.component.html',
  styleUrls: ['./home-tile.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeTileComponent {
  @Input() link = '';
  @Input() icon = '';
  @Input() title = '';
  @Input() badges: string[] = [];

  badgeClass(badge: string): string {
    switch (badge) {
      case 'cpu':
        return 'text-bg-primary';
      case 'person':
        return 'text-bg-success';
      case 'people':
        return 'text-bg-warning';
      case 'wifi':
        return 'text-bg-info';
      default:
        return '';
    }
  }

  badgeIcon(badge: string): string {
    switch (badge) {
      case 'cpu':
        return 'bi-cpu';
      case 'person':
        return 'bi-person';
      case 'people':
        return 'bi-people';
      case 'wifi':
        return 'bi-wifi';
      default:
        return '';
    }
  }
}
