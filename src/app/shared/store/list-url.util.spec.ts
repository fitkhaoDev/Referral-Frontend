import { convertToParamMap } from '@angular/router';
import { PageQuery } from '@core/models/api.model';
import { paramsToQuery, queryToParams } from './list-url.util';

const BASE: PageQuery = { page: 0, size: 20, sort: [], search: '', filters: {} };

describe('queryToParams', () => {
  it('omits defaults', () => {
    expect(queryToParams(BASE, 20)).toEqual({});
  });

  it('serialises non-defaults including a single sort and filters', () => {
    const params = queryToParams(
      {
        page: 2,
        size: 50,
        search: 'apollo',
        sort: [{ field: 'createdAt', direction: 'desc' }],
        filters: { status: 'ACTIVE', empty: '' },
      },
      20,
    );
    expect(params).toEqual({
      page: '2',
      size: '50',
      q: 'apollo',
      sort: 'createdAt,desc',
      status: 'ACTIVE',
    });
  });
});

describe('paramsToQuery', () => {
  it('round-trips a serialised query', () => {
    const original: PageQuery = {
      page: 3,
      size: 50,
      search: 'mehta',
      sort: [{ field: 'name', direction: 'asc' }],
      filters: { status: 'INACTIVE' },
    };
    const map = convertToParamMap(queryToParams(original, 20) as Record<string, string>);
    expect(paramsToQuery(map, BASE, ['status', 'category'])).toEqual(original);
  });

  it('falls back to base values for missing / invalid params', () => {
    const map = convertToParamMap({ page: 'x' });
    expect(paramsToQuery(map, BASE, [])).toEqual(BASE);
  });
});
