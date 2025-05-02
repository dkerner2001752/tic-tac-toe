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
  color = this.randomColor();

  private router: Router = inject(Router);

  public async navigateToGame() {
    await this.router.navigate([`/tic-tac-toe`]);
  }

  public randomColor() {
    const minFahrenheit = 1;
    const maxFahrenheit = 240;

    const tempCalc = ((Math.random() * 240) - minFahrenheit) / (maxFahrenheit - minFahrenheit);
    const tempInRange = Math.max(0, Math.min(1, tempCalc));

    const inverted = 1 - tempInRange;
    const hue = inverted * 240;

    return `hsl(${ hue }, 30%, 60%)`;
  }
}
