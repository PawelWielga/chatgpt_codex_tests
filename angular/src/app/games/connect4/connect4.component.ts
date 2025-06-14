import { Component, AfterViewInit } from '@angular/core';
import { initConnect4 } from './connect4';

@Component({
  selector: 'app-connect4',
  templateUrl: './connect4.component.html',
  styleUrls: ['./connect4.component.scss']
})
export class Connect4Component implements AfterViewInit {
  ngAfterViewInit(): void {
    initConnect4();
  }
}
