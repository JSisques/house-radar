import type { paths } from '@shared/domain/http-client/api-schema/api-schema';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Operation<M extends HttpMethod, P extends keyof paths> = NonNullable<paths[P][M]>;

/** Paths of the generated API contract that declare the given method. */
export type ApiPath<M extends HttpMethod> = {
  [P in keyof paths]: [NonNullable<paths[P][M]>] extends [never] ? never : P;
}[keyof paths];

type DefinedKeys<T> = { [K in keyof T as [NonNullable<T[K]>] extends [never] ? never : K]: T[K] };

type ParamsOption<O> = O extends { parameters: infer Q }
  ? DefinedKeys<Pick<Q, Extract<keyof Q, 'query' | 'path'>>> extends infer D
    ? keyof D extends never
      ? unknown
      : Partial<D> extends D
        ? { params?: D }
        : { params: D }
    : never
  : unknown;

type BodyOption<O> = O extends { requestBody?: infer R }
  ? [NonNullable<R>] extends [never]
    ? unknown
    : NonNullable<R> extends { content: { 'application/json': infer J } }
      ? undefined extends R
        ? { body?: J }
        : { body: J }
      : unknown
  : unknown;

export type RequestOptions<M extends HttpMethod, P extends ApiPath<M>> = ParamsOption<Operation<M, P>> &
  BodyOption<Operation<M, P>> & { signal?: AbortSignal };

type RequestArgs<M extends HttpMethod, P extends ApiPath<M>> =
  Partial<RequestOptions<M, P>> extends RequestOptions<M, P>
    ? [options?: RequestOptions<M, P>]
    : [options: RequestOptions<M, P>];

/** One member per response the contract declares, so `status` narrows `data`. */
export type ApiResult<M extends HttpMethod, P extends ApiPath<M>> =
  Operation<M, P> extends { responses: infer R }
    ? {
        [S in keyof R & number]: R[S] extends { content: { 'application/json': infer D } }
          ? { status: S; data: D }
          : { status: S; data: undefined };
      }[keyof R & number]
    : never;

/** Typed HTTP access to the API. Application code depends on this, never on a concrete client. */
export interface HttpClientPort {
  request<M extends HttpMethod, P extends ApiPath<M>>(
    method: M,
    path: P,
    ...args: RequestArgs<M, P>
  ): Promise<ApiResult<M, P>>;
}
