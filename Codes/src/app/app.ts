import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <-- only RouterOutlet is needed for routing
  template: `<router-outlet></router-outlet>`,
})
export class App {
  protected title = 'movo-project';
}
