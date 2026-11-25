/** Stateless factory injected into handlers. Builders are stateful, so each execution calls `create()`. */
export interface IBuilderFactory<TBuilder> {
  create(): TBuilder;
}
