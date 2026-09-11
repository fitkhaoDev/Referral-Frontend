import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockAuthApiService } from './mock-auth-api.service';

describe('MockAuthApiService', () => {
  let api: MockAuthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockAuthApiService] });
    api = TestBed.inject(MockAuthApiService);
  });

  it('issues a token for valid admin credentials', async () => {
    const res = await firstValueFrom(
      api.login('admin', { identifier: 'admin@fitkhao.com', password: 'Admin@123' }),
    );
    expect(res.accessToken).toContain('mock.');
    expect(res.mustChangePassword).toBe(false);
    expect(res.permissions.length).toBeGreaterThan(0);
  });

  it('rejects wrong credentials with 401', async () => {
    await expect(
      firstValueFrom(api.login('admin', { identifier: 'admin@fitkhao.com', password: 'nope' })),
    ).rejects.toMatchObject({ status: 401, code: 'AUTH_INVALID_CREDENTIALS' });
  });

  it('flags the first-login partner as mustChangePassword', async () => {
    const res = await firstValueFrom(
      api.login('partner', { identifier: 'dr.john@example.com', password: 'Temp@1234' }),
    );
    expect(res.mustChangePassword).toBe(true);
  });

  it('blocks a deactivated partner with 403', async () => {
    await expect(
      firstValueFrom(
        api.login('partner', { identifier: 'old.partner@example.com', password: 'Partner@123' }),
      ),
    ).rejects.toMatchObject({ status: 403, code: 'AUTH_ACCOUNT_DEACTIVATED' });
  });

  it('accepts login by Partner ID', async () => {
    const res = await firstValueFrom(
      api.login('partner', { identifier: 'FK-ORG-000007', password: 'Partner@123' }),
    );
    expect(res.user.partnerId).toBe('FK-ORG-000007');
  });

  it('clears mustChangePassword after a compliant password change', async () => {
    await firstValueFrom(
      api.login('partner', { identifier: 'dr.john@example.com', password: 'Temp@1234' }),
    );
    const res = await firstValueFrom(
      api.changePassword('partner', { currentPassword: 'Temp@1234', newPassword: 'NewPass123' }),
    );
    expect(res.mustChangePassword).toBe(false);
  });

  it('rejects a weak new password with 422 and a field error', async () => {
    await expect(
      firstValueFrom(
        api.changePassword('partner', { currentPassword: 'Temp@1234', newPassword: 'weak' }),
      ),
    ).rejects.toMatchObject({ status: 422, code: 'AUTH_PASSWORD_POLICY' });
  });
});
