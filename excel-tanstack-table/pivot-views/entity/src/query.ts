export abstract class Query {}

export interface IQueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

export interface IQueryBus<TQuery extends Query = Query> {
  execute<TResult>(command: TQuery): Promise<TResult>;
}
