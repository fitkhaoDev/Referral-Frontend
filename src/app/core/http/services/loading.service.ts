import { Injectable, computed, signal } from '@angular/core';

/** Tracks in-flight backend requests so shells can show a global progress indicator. */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly inFlight = signal(0);

  readonly active = computed(() => this.inFlight() > 0);

  begin(): void {
    this.inFlight.update((n) => n + 1);
  }

  end(): void {
    this.inFlight.update((n) => Math.max(0, n - 1));
  }
}
