import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-query-status',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <ng-container *ngIf="showSpinner; else notLoading">
      <div class="qs-center">
        <app-loading-spinner label="Loading..." />
      </div>
    </ng-container>
    <ng-template #notLoading>
      <div *ngIf="errorMessage; else content" class="qs-error" role="alert">
        {{ errorMessage }}
      </div>
      <ng-template #content>
        <ng-content></ng-content>
      </ng-template>
    </ng-template>
  `,
  styles: [
    `
      .qs-center {
        display: grid;
        place-items: center;
        padding: 1rem;
      }
      .qs-error {
        color: #b00020;
        background: #fde7e9;
        border: 1px solid #f5c2c7;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class QueryStatusComponent {
  @Input() query?: {
    isLoading?: (() => boolean) | boolean;
    isFetching?: (() => boolean) | boolean;
    isPending?: (() => boolean) | boolean;
    isSuccess?: (() => boolean) | boolean;
    error?: (() => any) | any;
  } | null;
  @Input() loading = false;
  @Input() error: any = null;

  // Treat only initial pending as blocking for spinner; ignore any other fetching states
  get isInitialLoading() {
    const q = this.query;
    const pending = this.readFlag(q?.isPending, q) === true;
    return this.loading || pending;
  }

  get errorMessage(): string | null {
    const errProp = this.query?.error;
    const errFromQuery =
      typeof errProp === 'function'
        ? (errProp as any).call(this.query)
        : errProp;
    const err = this.error ?? errFromQuery;
    if (!err) return null;
    if (typeof err === 'string') return err;
    return err?.message ?? 'An error occurred while loading data.';
  }

  get isSuccess(): boolean {
    return !!this.readFlag(this.query?.isSuccess, this.query);
  }

  private get hasData(): boolean {
    const q = this.query as any;
    if (!q) return false;
    try {
      const d = typeof q.data === 'function' ? q.data.call(q) : q.data;
      return d != null;
    } catch {
      return false;
    }
  }

  get showSpinner(): boolean {
    // Show spinner only on initial load (pending/loading) and only when there is no data yet
    return !this.hasData && this.isInitialLoading;
  }

  private readFlag(
    flag?: (() => boolean) | boolean | null,
    owner?: any
  ): boolean | undefined {
    if (flag == null) return undefined;
    try {
      if (typeof flag === 'function') {
        // Bind to the owner (query object) if provided to preserve method context
        return owner ? (flag as any).call(owner) : (flag as () => boolean)();
      }
      return !!flag;
    } catch {
      return undefined;
    }
  }
}
