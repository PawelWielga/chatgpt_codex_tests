import { AfterViewInit } from '@angular/core';
import { initTictactoe } from './tictactoe';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tictactoe',
  templateUrl: './tictactoe.component.html',
  styleUrls: ['./tictactoe.component.scss']
})
export class TictactoeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initTictactoe();
  }
}
