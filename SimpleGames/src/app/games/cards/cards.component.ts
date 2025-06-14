import { AfterViewInit } from '@angular/core';
import { initCards } from './js/main';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initCards();
  }
}
