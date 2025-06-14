import { AfterViewInit } from '@angular/core';
import { initPong } from './pong';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.scss']
})
export class PongComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initPong();
  }
}
