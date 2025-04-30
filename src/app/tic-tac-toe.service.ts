import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TicTacToeType } from '../tic-tac-toe/tic-tac-toe.component';

export interface PostGameDto {
  game: string
  move: number
  board: TicTacToeType[]
}

export interface GetGameDto {
  moves: PostGameDto[]
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
    return firstValueFrom(this.httpClient.get<GetGameDto>(`${this.baseUrl}game/${gameId}`));
  }

  public async postGameProgress(body: PostGameDto[]) {
    return firstValueFrom(this.httpClient.post(`${this.baseUrl}game`, body));
  }
}
