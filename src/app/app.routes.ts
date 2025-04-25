import { Routes } from '@angular/router';
import { TicTacToeComponent } from '../tic-tac-toe/tic-tac-toe.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {path: 'tic-tac-toe', component: TicTacToeComponent},
  {path: '*', component: AppComponent, redirectTo: ''}
]
