import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('is inactive with no requests', () => {
    expect(service.active()).toBe(false);
  });

  it('is active while at least one request is in flight', () => {
    service.begin();
    expect(service.active()).toBe(true);
    service.begin();
    service.end();
    expect(service.active()).toBe(true);
    service.end();
    expect(service.active()).toBe(false);
  });

  it('never drops below zero', () => {
    service.end();
    service.end();
    expect(service.active()).toBe(false);
    service.begin();
    expect(service.active()).toBe(true);
  });
});
