import { AfterViewInit } from '@angular/core';
import { initMemo } from './memo';
import { Component } from '@angular/core';

@Component({
  selector: 'app-memo',
  templateUrl: './memo.component.html',
  styleUrls: ['./memo.component.scss']
})
export class MemoComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initMemo();
  }
}
