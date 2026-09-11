import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { authFeature } from '@core/auth/store/auth.reducer';
import { PartnerModule } from '../../partner.module';
import { PartnerShellComponent } from './partner-shell.component';

describe('PartnerShellComponent', () => {
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

  it('renders the primary navigation in both the rail and the tab bar', () => {
    const fixture = TestBed.createComponent(PartnerShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.railnav a').length).toBe(5);
    expect(fixture.nativeElement.querySelectorAll('.tabbar a').length).toBe(5);
  });
});
