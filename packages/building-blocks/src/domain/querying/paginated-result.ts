/** One page of results plus the total number of matches. */
export class PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;

  constructor(items: readonly T[], total: number, page: number, pageSize: number) {
    this.items = Object.freeze([...items]);
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    Object.freeze(this);
  }

  get totalPages(): number {
    return this.pageSize === 0 ? 0 : Math.ceil(this.total / this.pageSize);
  }
}
