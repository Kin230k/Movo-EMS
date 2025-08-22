import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginAdmin } from './pages/login/admin/login-admin';
import { LoginUser } from './pages/login/login-user';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginAdmin, LoginUser],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'movo-project';
}
