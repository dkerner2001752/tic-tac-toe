import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {
  title = 'tic-tac-toe';

  private router: Router = inject(Router);

  public async navigateToGame() {
    await this.router.navigate([`/tic-tac-toe`]);
  }
}
