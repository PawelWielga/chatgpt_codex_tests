import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

import { Connect4Component } from './games/connect4/connect4.component';
import { CardsComponent } from './games/cards/cards.component';
import { CubeComponent } from './games/cube/cube.component';
import { HotpotatoComponent } from './games/hotpotato/hotpotato.component';
import { LifeComponent } from './games/life/life.component';
import { MemoComponent } from './games/memo/memo.component';
import { MinesweeperComponent } from './games/minesweeper/minesweeper.component';
import { PongComponent } from './games/pong/pong.component';
import { RpsComponent } from './games/rps/rps.component';
import { SnakeComponent } from './games/snake/snake.component';
import { TetrisComponent } from './games/tetris/tetris.component';
import { TictactoeComponent } from './games/tictactoe/tictactoe.component';

@NgModule({
  declarations: [
    AppComponent,
    Connect4Component,
    CardsComponent,
    CubeComponent,
    HotpotatoComponent,
    LifeComponent,
    MemoComponent,
    MinesweeperComponent,
    PongComponent,
    RpsComponent,
    SnakeComponent,
    TetrisComponent,
    TictactoeComponent
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
