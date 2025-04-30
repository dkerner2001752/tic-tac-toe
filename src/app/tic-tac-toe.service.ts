import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface PostGameDto {
  game: string
  move: number
  board: ('x' | 'o' | '')[]
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

  public async postGameProgress(body: PostGameDto[]) {
    return firstValueFrom(this.httpClient.post(`${this.baseUrl}game`, body));
  }
}
