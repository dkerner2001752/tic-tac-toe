import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgForOf } from '@angular/common';
import { PostGameDto, TicTacToeService } from '../app/tic-tac-toe.service';
import { map, Observable } from 'rxjs';


export type TicTacToeType = 'x' | 'o' | '';

type TicTacToeWinner = TicTacToeType | 'Draw';

interface TicTacToeOptions {
  buttonValues: FormArray<FormControl<TicTacToeType>>;
  gameId: FormControl<string>;
}

@Component({
  selector: 'app-tic-tac-toe',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    AsyncPipe,
    JsonPipe
  ],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.css'
})
export class TicTacToeComponent implements OnInit {
  public ticTacToeFormGroup!: FormGroup<TicTacToeOptions>;

  public playerWon$!: Observable<TicTacToeWinner>;

  public hasPlayerWon = false;
  public currentPlayer: TicTacToeType = 'x';
  public playerMoveCounter = 1;
  public gameHistory: PostGameDto[] = [];
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
    });

    this.ticTacToeFormGroup.controls.gameId.valueChanges.subscribe(async (x) => {
      const response = await this.tttService.getGameHistory(x)
      console.log('History', response, 'Array');
      const history = response.moves;
      this.gameHistory = history;
      this.playerMoveCounter = history.length + 1;
      this.currentPlayer = history.length % 2 == 0 ? 'o' : 'x';
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
    this.ticTacToeFormGroup.controls.buttonValues.controls[index].patchValue(this.currentPlayer);

    const gameUpdate: PostGameDto = {
      game: this.ticTacToeFormGroup.controls.gameId.value,
      move: this.playerMoveCounter,
      board: this.ticTacToeFormGroup.controls.buttonValues.value
    }

    this.gameHistory.push(gameUpdate);

    this.tttService.postGameProgress(this.gameHistory).then(response => {
      this.gameState = response;
    }).catch(error => {
      console.log(error);
    });

    if (!this.hasPlayerWon) {
      this.currentPlayer = (this.currentPlayer === 'x') ? 'o' : 'x';
    }

    this.playerMoveCounter++
  }

  public playAgain() {
    this.ticTacToeFormGroup.controls.buttonValues.reset();
    this.ticTacToeFormGroup.controls.gameId.reset(crypto.randomUUID());

    this.gameHistory = [];
    this.playerMoveCounter = 1;
    this.currentPlayer = 'x';
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

    const testForNull = arrValues.some(square => square === '')

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
