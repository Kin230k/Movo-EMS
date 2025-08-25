import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import {
  debounceTime,
  map,
  startWith,
  distinctUntilChanged,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  // change breakpoint if you like
  private readonly BREAKPOINT = 768;

  // public observable components can subscribe to (or use async pipe)
  readonly isMobile$ = fromEvent(window, 'resize').pipe(
    debounceTime(100),
    map(() => window.innerWidth <= this.BREAKPOINT),
    startWith(window.innerWidth <= this.BREAKPOINT),
    distinctUntilChanged()
  );

  // convenience synchronous getter (snapshot)
  get isMobile(): boolean {
    return window.innerWidth <= this.BREAKPOINT;
  }
}
