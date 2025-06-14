import { AfterViewInit } from '@angular/core';
import { initHotpotato } from './hotpotato';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hotpotato',
  templateUrl: './hotpotato.component.html',
  styleUrls: ['./hotpotato.component.scss']
})
export class HotpotatoComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initHotpotato();
  }
}
