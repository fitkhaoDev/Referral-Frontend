import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { AnalyticsModule } from '../../analytics.module';
import { AnalyticsOverviewComponent } from './analytics-overview.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('AnalyticsOverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('loads the overview and renders KPI figures + charts', async () => {
    const fixture = TestBed.createComponent(AnalyticsOverviewComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Referrals');
    expect(text).toContain('Commissions earned');
    expect(text).toContain('Top organisations');

    const kpiValues = Array.from(fixture.nativeElement.querySelectorAll('.kpi__v')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(kpiValues.length).toBe(7);
    expect(kpiValues.some((v) => /\d/.test(v ?? ''))).toBe(true);

    expect(fixture.nativeElement.querySelectorAll('ngx-charts-line-chart').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('.rank li').length).toBeGreaterThan(0);
  }, 20000);

  it('changing granularity reloads with a different bucket count', async () => {
    const fixture = TestBed.createComponent(AnalyticsOverviewComponent);
    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (v: unknown) => void };
      vm: () => { data: { referralsOverTime: unknown[] } | null };
    };
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    expect(component.vm().data?.referralsOverTime.length).toBe(12);

    component.form.patchValue({ granularity: 'YEAR' });
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    expect(component.vm().data?.referralsOverTime.length).toBe(3);
  }, 20000);
});
