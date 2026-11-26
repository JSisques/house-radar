export const TRANSACTION_MANAGER_TOKEN = Symbol('TRANSACTION_MANAGER_TOKEN');

/** Runs `fn` in one database transaction: commits when it resolves, rolls back when it throws. */
export interface ITransactionManager {
  run<T>(fn: () => Promise<T>): Promise<T>;
}
