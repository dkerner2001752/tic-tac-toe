import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgForOf } from '@angular/common';
import { MovesDto, PostGameDto, TicTacToeService } from '../app/tic-tac-toe.service';
import { filter, interval, map, merge, Observable, startWith, switchMap, tap } from 'rxjs';


export type TicTacToeType = 'x' | 'o' | '';

type TicTacToeWinner = TicTacToeType | 'Draw';

interface TicTacToeOptions {
  buttonValues: FormArray<FormControl<TicTacToeType>>;
  gameId: FormControl<string>;
  currentPlayer: FormControl<TicTacToeType | null>
  selectedPlayer: FormControl<TicTacToeType>
}

@Component({
  selector: 'app-tic-tac-toe',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.css'
})
export class TicTacToeComponent implements OnInit {
  public ticTacToeFormGroup!: FormGroup<TicTacToeOptions>;

  public playerWon$!: Observable<TicTacToeWinner>;

  public hasPlayerWon = false;
  public playerMoveCounter = 1;
  public gameHistory: MovesDto[] = [];
  public players: string[] = [];
  public gameState = {};

  private readonly router = inject(Router);
  private readonly tttService = inject(TicTacToeService);

  ngOnInit() {
    this.ticTacToeFormGroup = new FormGroup<TicTacToeOptions>({
      buttonValues: new FormArray<FormControl<TicTacToeType>>([
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true}),
        new FormControl('', {nonNullable: true})
      ]),
      gameId: new FormControl(crypto.randomUUID(), {nonNullable: true, updateOn: 'blur'}),
      currentPlayer: new FormControl(null),
      selectedPlayer: new FormControl('', {nonNullable: true}),
    });

    const gameIdChange$= this.ticTacToeFormGroup.controls.gameId.valueChanges.pipe(
      startWith(this.ticTacToeFormGroup.controls.gameId),
      switchMap(() => {
        return this.tttService.getGameHistory(this.ticTacToeFormGroup.controls.gameId.value);
      }),
      tap(response => {
        this.ticTacToeFormGroup.controls.buttonValues.reset();
        this.players = [];
        this.gameHistory = [];
        this.playerMoveCounter = 1;
        this.ticTacToeFormGroup.controls.currentPlayer.setValue('x');

        if (response.players.length === 0) {
          const game: PostGameDto = {
            players: ['x'],
            moves: this.gameHistory,
          }
          this.tttService.postGameProgress(game, this.ticTacToeFormGroup.controls.gameId.value);
          this.ticTacToeFormGroup.controls.selectedPlayer.setValue('x');
        }
        if (response.players.length === 1) {
          const game: PostGameDto = {
            players: ['x', 'o'],
            moves: this.gameHistory,
          }
          this.tttService.postGameProgress(game, this.ticTacToeFormGroup.controls.gameId.value);
          this.ticTacToeFormGroup.controls.selectedPlayer.setValue('o');
        }
      }),
      switchMap(() => {
        return interval(1000);
      }),
      filter(() => this.ticTacToeFormGroup.controls.selectedPlayer.value !== this.ticTacToeFormGroup.controls.currentPlayer.value),
      switchMap(() => {
        return this.tttService.getGameHistory(this.ticTacToeFormGroup.controls.gameId.value);
      }),
    ).subscribe(response => {
      const history = response.moves;
      this.gameHistory = history;
      this.players = response.players;
      this.playerMoveCounter = history.length + 1;
      this.ticTacToeFormGroup.controls.currentPlayer.setValue(history.length % 2 == 0 ? 'x' : 'o');
      const last = history.at(-1);
      if (last) {
        this.ticTacToeFormGroup.controls.buttonValues.setValue(last.board);
      }
    });

    this.playerWon$ = this.ticTacToeFormGroup.controls.buttonValues.valueChanges.pipe(
      map(x => this.validateWinner(x))
    );
  }

  public async navigateToHome() {
    await this.router.navigate([``]);
  }

  public onButtonClick(index: number) {
    if (!this.ticTacToeFormGroup.controls.currentPlayer.value)
      return;
    this.ticTacToeFormGroup.controls.buttonValues.controls[index].patchValue(this.ticTacToeFormGroup.controls.currentPlayer.value);

    const gameUpdate: MovesDto = {
      game: this.ticTacToeFormGroup.controls.gameId.value,
      move: this.playerMoveCounter,
      board: this.ticTacToeFormGroup.controls.buttonValues.value
    }

    this.gameHistory.push(gameUpdate);

    const game: PostGameDto = {
      players: this.players,
      moves: this.gameHistory,
    };
    this.tttService.postGameProgress(game, this.ticTacToeFormGroup.controls.gameId.value).then(response => {
      this.gameState = response;
    }).catch(error => {
      console.log(error);
    });

    if (!this.hasPlayerWon) {
      this.ticTacToeFormGroup.controls.currentPlayer.setValue((this.ticTacToeFormGroup.controls.currentPlayer.value === 'x') ? 'o' : 'x');
    }

    this.playerMoveCounter++
  }

  public playAgain() {
    this.ticTacToeFormGroup.controls.gameId.reset(crypto.randomUUID());
  }

  public validateWinner(arrValues: TicTacToeType[]) {
    const rowOne = [arrValues[0], arrValues[1], arrValues[2]];
    const rowTwo = [arrValues[3], arrValues[4], arrValues[5]];
    const rowThree = [arrValues[6], arrValues[7], arrValues[8]];
    const columnOne = [arrValues[0], arrValues[3], arrValues[6]];
    const columnTwo = [arrValues[1], arrValues[4], arrValues[7]];
    const columnThree = [arrValues[2], arrValues[5], arrValues[8]];
    const diagonalOne = [arrValues[0], arrValues[4], arrValues[8]];
    const diagonalTwo = [arrValues[2], arrValues[4], arrValues[6]];

    const testArr = [rowOne, rowTwo, rowThree, columnOne, columnTwo, columnThree, diagonalOne, diagonalTwo];

    const testForX = testArr.some(line => (line.every(x => x === 'x')));
    const testForO = testArr.some(line => (line.every(x => x === 'o')));
    const testForNull = arrValues.some(square => square === '');

    if (testForX) {
      return 'x';
    } else if (testForO) {
      return 'o';
    } else if (testForNull) {
      return '';
    } else {
      return 'Draw';
    }
  }
}
