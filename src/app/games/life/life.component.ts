import { AfterViewInit } from '@angular/core';
import { initLife } from './life';
import { Component } from '@angular/core';

@Component({
  selector: 'app-life',
  templateUrl: './life.component.html',
  styleUrls: ['./life.component.scss']
})
export class LifeComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initLife();
  }
}
