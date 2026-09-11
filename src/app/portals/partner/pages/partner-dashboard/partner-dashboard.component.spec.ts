import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { authFeature } from '@core/auth/store/auth.reducer';
import { PartnerModule } from '../../partner.module';
import { PartnerDashboardComponent } from './partner-dashboard.component';

describe('PartnerDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PartnerModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        StoreModule.forFeature(authFeature),
      ],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(PartnerDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
