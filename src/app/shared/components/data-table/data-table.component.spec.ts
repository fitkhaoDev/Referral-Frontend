import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortSpec } from '@core/models/api.model';
import { SharedModule } from '../../shared.module';

interface Row {
  id: string;
  name: string;
  status: string;
}

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-data-table
      [columns]="columns"
      [rows]="rows"
      [rowId]="rowId"
      [sort]="sort"
      [loading]="loading"
      (sortChange)="lastSort = $event"
    >
      <ng-template appColumnCell="status" let-row>
        <span class="tpl-status">{{ row.status }}</span>
      </ng-template>
    </app-data-table>
  `,
})
class HostComponent {
  columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status' },
  ];
  rows: Row[] = [
    { id: '1', name: 'Alpha', status: 'ACTIVE' },
    { id: '2', name: 'Bravo', status: 'INACTIVE' },
  ];
  rowId = (r: Row) => r.id;
  sort: SortSpec[] = [];
  loading = false;
  lastSort: SortSpec[] = [];
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders a row per item', () => {
    const bodyRows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(2);
  });

  it('uses the projected cell template for the status column', () => {
    expect(fixture.nativeElement.querySelectorAll('.tpl-status').length).toBe(2);
  });

  it('emits an ascending sort on first header click', () => {
    const sortButton = fixture.nativeElement.querySelector('thead .dt__sort') as HTMLButtonElement;
    sortButton.click();
    expect(fixture.componentInstance.lastSort).toEqual([{ field: 'name', direction: 'asc' }]);
  });

  it('shows the empty state with no rows', () => {
    fixture.componentInstance.rows = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
  });
});
