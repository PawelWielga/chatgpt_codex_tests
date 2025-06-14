import { AfterViewInit } from '@angular/core';
import { initCube } from './cube';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initCube();
  }
}
