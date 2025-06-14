import { AfterViewInit } from '@angular/core';
import { initTetris } from './tetris';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss']
})
export class TetrisComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initTetris();
  }
}
