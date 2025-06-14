import { AfterViewInit } from '@angular/core';
import { initSnake } from './snake';
import { Component } from '@angular/core';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initSnake();
  }
}
