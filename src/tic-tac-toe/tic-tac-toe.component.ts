import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

type TicTacToeType = 'X' | 'O' | null;

@Component({
  selector: 'app-tic-tac-toe',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.css'
})
export class TicTacToeComponent implements OnInit, OnDestroy {
  public ticTacToeFormGroup= new FormGroup({
    values: new FormArray<FormControl<TicTacToeType>>([
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

  private currentPlayer: TicTacToeType = 'X';
  private subscription = new Subscription();

  private readonly router = inject(Router);

  ngOnInit() {
    this.ticTacToeFormGroup.controls.values.valueChanges.subscribe(() => {
      this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public async navigateToHome() {
    await this.router.navigate([``]);
  }

  public onButtonClick(index: number) {
    this.ticTacToeFormGroup.controls.values.controls[index].patchValue(this.currentPlayer);
  }

  public playAgain() {
    this.ticTacToeFormGroup.controls.values.reset()
  }

  public testForWinner() {
    const rowValidators = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    const columnValidators = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
    const diagonalValidators = [[0, 4, 8], [2, 4, 6]];


  }
}
