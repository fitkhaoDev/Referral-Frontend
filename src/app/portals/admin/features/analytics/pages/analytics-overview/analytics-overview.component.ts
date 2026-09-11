import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { Observable, catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { AnalyticsApi } from '../../data-access/analytics-api.abstract';
import {
  ANALYTICS_GRANULARITY_LABEL,
  AnalyticsGranularity,
  AnalyticsOverview,
  NamedSeries,
  SeriesPoint,
} from '../../models/analytics.model';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'Could not load analytics. Please try again.' };
}

interface Vm {
  readonly loading: boolean;
  readonly data: AnalyticsOverview | null;
  readonly error: ApiError | null;
}

@Component({
  selector: 'app-analytics-overview',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-overview.component.html',
  styleUrl: './analytics-overview.component.css',
})
export class AnalyticsOverviewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AnalyticsApi);

  protected readonly granularityOptions: SelectOption[] = (
    ['MONTH', 'QUARTER', 'YEAR'] as AnalyticsGranularity[]
  ).map((v) => ({ value: v, label: ANALYTICS_GRANULARITY_LABEL[v] }));

  protected readonly form = this.fb.nonNullable.group({
    granularity: 'MONTH' as AnalyticsGranularity,
    fromDate: '',
    toDate: '',
  });

  /** FitKhao palette for every chart. */
  protected readonly scheme: Color = {
    name: 'fitkhao',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#12b76a', '#0f7a4a', '#b42318', '#7a8a80', '#2e90fa', '#f79009'],
  };
  protected readonly LegendPosition = LegendPosition;

  private readonly vm$: Observable<Vm> = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    debounceTime(150),
    map((v) => ({
      granularity: (v.granularity ?? 'MONTH') as AnalyticsGranularity,
      fromDate: v.fromDate || undefined,
      toDate: v.toDate || undefined,
    })),
    switchMap((q) =>
      this.api.getOverview(q).pipe(
        map((data): Vm => ({ loading: false, data, error: null })),
        catchError((e: unknown): Observable<Vm> =>
          of({ loading: false, data: null, error: toApiError(e) }),
        ),
        startWith<Vm>({ loading: true, data: null, error: null }),
      ),
    ),
  );

  protected readonly vm = toSignal(this.vm$, {
    initialValue: { loading: true, data: null, error: null } satisfies Vm,
  });

  protected readonly currencyAxis = (value: number): string =>
    '₹' + Number(value).toLocaleString('en-IN');

  /** ngx-charts wants mutable arrays; the model is readonly. */
  protected referralsChart(d: AnalyticsOverview): NamedSeries[] {
    return [{ name: 'Referrals', series: [...d.referralsOverTime] }];
  }
  protected commissionsChart(d: AnalyticsOverview): NamedSeries[] {
    return d.commissionsOverTime.map((s) => ({ name: s.name, series: [...s.series] }));
  }
  protected withdrawalsChart(d: AnalyticsOverview): NamedSeries[] {
    return [{ name: 'Withdrawals paid', series: [...d.withdrawalsOverTime] }];
  }
  protected pie(points: readonly SeriesPoint[]): SeriesPoint[] {
    return [...points];
  }

  protected retry(): void {
    this.form.setValue(this.form.getRawValue());
  }
}
