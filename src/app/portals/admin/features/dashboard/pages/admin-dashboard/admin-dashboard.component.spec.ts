import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { authFeature } from '@core/auth/store/auth.reducer';
import { DashboardModule } from '../../dashboard.module';
import { AdminDashboardComponent } from './admin-dashboard.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('AdminDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        StoreModule.forFeature(authFeature),
      ],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders live operational counts and the activity panels once data resolves', async () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    await wait(1500);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Partners');
    expect(text).toContain('Withdrawals to review');
    expect(text).toContain('Latest commissions');

    const values = Array.from(fixture.nativeElement.querySelectorAll('.card__value')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(values.length).toBeGreaterThan(0);
    expect(values.some((v) => /^\d+$/.test(v ?? ''))).toBe(true);

    expect(fixture.nativeElement.querySelectorAll('.panel .list li').length).toBeGreaterThan(0);
  }, 20000);

  it('links each stat card through to its screen once loaded', async () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    await wait(1500);
    fixture.detectChanges();

    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a.card')).map((a) =>
      (a as HTMLAnchorElement).getAttribute('href'),
    );
    expect(hrefs).toContain('/admin/partners');
    expect(hrefs).toContain('/admin/commissions');
    expect(hrefs.some((h) => h?.startsWith('/admin/withdrawals'))).toBe(true);
  }, 20000);
});
