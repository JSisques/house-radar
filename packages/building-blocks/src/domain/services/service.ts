/** Standard contract for application services: one public `execute(input)` method. */
export interface IService<TInput, TOutput> {
  execute(input: TInput): TOutput | Promise<TOutput>;
}
