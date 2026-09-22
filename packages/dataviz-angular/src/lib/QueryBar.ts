import { ChangeDetectionStrategy, Component, Input as NgInput, signal } from '@angular/core';
import { Search, type SearchProps, type SearchSize } from '@sentropic/design-system-angular';
import { buildQueryFilterSpec, type DashboardStore } from '@sentropic/dataviz-core';
import { classNames } from './classNames.js';

export type QueryBarProps = {
  store: DashboardStore;
  /** Dimension owned by this query bar. Matching rows include this dimension's values. */
  dimension: string;
  /** Fields searched for the query. Defaults to the owned dimension. */
  fields?: readonly string[];
  label?: SearchProps['label'];
  placeholder?: string;
  clearLabel?: string;
  size?: SearchSize;
  minLength?: number;
  caseSensitive?: boolean;
  class?: string;
};

/** State wiring for a DS Angular Search. */
@Component({
  selector: 'st-dataviz-query-bar',
  standalone: true,
  imports: [Search],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-search
      [label]="label"
      [value]="query()"
      [placeholder]="placeholder"
      [clearLabel]="clearLabel"
      [size]="size"
      [class]="searchClass"
      (modelValueChange)="handleSearchValueChange($event)"
      (clear)="handleClear()"
    ></st-search>
  `,
})
export class QueryBar {
  static readonly stComponentName = 'QueryBar';

  private readonly querySignal = signal('');
  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('QueryBar: store is required.');
    }
    return this.storeValue;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput() fields?: readonly string[];
  @NgInput() label: SearchProps['label'] = 'Search';
  @NgInput() placeholder = 'Search';
  @NgInput() clearLabel?: string;
  @NgInput() size?: SearchSize;
  @NgInput() minLength?: number;
  @NgInput() caseSensitive?: boolean;
  @NgInput('class') classInput?: string;

  readonly query = this.querySignal.asReadonly();

  get searchClass(): string {
    return classNames('st-queryBar', this.classInput);
  }

  handleSearchValueChange(next: string): void {
    this.querySignal.set(next);
    const spec = buildQueryFilterSpec(this.store.model, this.store.data, {
      dimension: this.dimension,
      fields: this.fields,
      query: next,
      minLength: this.minLength,
      caseSensitive: this.caseSensitive,
    });
    if (spec) this.store.setFilter(this.dimension, spec);
    else this.store.clearFilter(this.dimension);
  }

  handleClear(): void {
    this.handleSearchValueChange('');
  }
}
