import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { TicTacToeService } from '../app/tic-tac-toe.service';
import { map, Observable } from 'rxjs';

type TicTacToeType = 'X' | 'O' | null;

type TicTacToeWinner = TicTacToeType | 'Draw';

interface TicTacToeOptions {
  buttonValues: FormArray<FormControl<TicTacToeType>>;
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
  public currentPlayer: TicTacToeType = 'X';

  public gameHistory = {};

  private readonly router = inject(Router);
  private readonly tttService = inject(TicTacToeService);

  ngOnInit() {
    this.ticTacToeFormGroup = new FormGroup<TicTacToeOptions>({
      buttonValues: new FormArray<FormControl<TicTacToeType>>([
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null)
      ])
    });

    this.playerWon$ = this.ticTacToeFormGroup.controls.buttonValues.valueChanges.pipe(
      map(x => this.validateWinner(x))
    );

    this.tttService.getGameIDList().then(gameIDList => {
    });
  }

  public async navigateToHome() {
    await this.router.navigate([``]);
  }

  public onButtonClick(index: number) {
    this.ticTacToeFormGroup.controls.buttonValues.controls[index].patchValue(this.currentPlayer);

    this.tttService.postGameProgress([]).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });

    if (!this.hasPlayerWon) {
      this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
    }
  }

  public playAgain() {
    this.ticTacToeFormGroup.controls.buttonValues.reset();

    this.currentPlayer === 'X';
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

    const testForX = testArr.some(line => (line.every(x => x === 'X')));
    const testForO = testArr.some(line => (line.every(x => x === 'O')));

    const testForNull = arrValues.some(square => square === null)

    if (testForX) {
      return 'X';
    } else if (testForO) {
      return 'O';
    } else if (testForNull) {
      return null;
    } else {
      return 'Draw';
    }
  }
}
