import { AfterViewInit } from '@angular/core';
import { initRps } from './rps';
import { Component } from '@angular/core';

@Component({
  selector: 'app-rps',
  templateUrl: './rps.component.html',
  styleUrls: ['./rps.component.scss']
})
export class RpsComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initRps();
  }
}
