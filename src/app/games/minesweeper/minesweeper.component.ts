import { AfterViewInit } from '@angular/core';
import { initMinesweeper } from './minesweeper';
import { Component } from '@angular/core';

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss']
})
export class MinesweeperComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initMinesweeper();
  }
}
