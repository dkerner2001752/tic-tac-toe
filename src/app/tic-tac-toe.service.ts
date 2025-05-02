import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TicTacToeType } from '../tic-tac-toe/tic-tac-toe.component';

export interface MovesDto {
  game: string,
  move: number,
  board: TicTacToeType[],
}

export interface PostGameDto {
  players: string[],
  moves: MovesDto[],
}

export interface GetGameDto {
  moves: MovesDto[],
}

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {

  public baseUrl: string = 'http://localhost:3000/';

  private httpClient = inject(HttpClient);

  public async getGameIDList() {
    return firstValueFrom(this.httpClient.get(this.baseUrl));
  }

  public async getGameHistory(gameId: string) {
    return firstValueFrom(this.httpClient.get<PostGameDto>(`${this.baseUrl}game/${gameId}`));
  }

  public async postGameProgress(body: PostGameDto, gameId: string) {
    return firstValueFrom(this.httpClient.post(`${this.baseUrl}game/${gameId}`, body));
  }
}
