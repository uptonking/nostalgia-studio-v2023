import { parse } from 'node:url';
import { type IncomingMessage, type ServerResponse } from 'node:http';

type IRoute = {
  method: string;
  url: string[];
  handler: (...args: any) => void;
};

/** A URL router for the server. */
export class Router {
  routes: IRoute[];

  constructor() {
    this.routes = [];
  }

  add(method: string, url: string[], handler: IRoute['handler']) {
    this.routes.push({ method, url, handler });
  }

  /** (union<string, RegExp, Array>, string) → union<Array, null>
   * Check whether a route pattern matches a given URL path.
   */
  match(pattern: string | RegExp | string[], path: string) {
    if (typeof pattern === 'string') {
      if (pattern === path) return [] as string[];
    } else if (pattern instanceof RegExp) {
      const match = pattern.exec(path);
      return match && match.slice(1);
    } else {
      const parts = path.slice(1).split('/');
      // console.log(';; curr-routh ', parts);

      if (parts.length && !parts[parts.length - 1]) parts.pop();
      if (parts.length !== pattern.length) return null;
      const result = [];
      for (let i = 0; i < parts.length; i++) {
        const pat = pattern[i];
        if (pat) {
          if (pat !== parts[i]) return null;
        } else {
          result.push(parts[i]);
        }
      }
      return result;
    }
  }

  /** Resolve a request, letting the matching route write a response. */
  resolve(
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage> & { req: IncomingMessage },
  ) {
    const parsed = parse(request.url, true);
    const path = parsed.pathname;
    // @ts-expect-error custom prop
    request.query = parsed.query;

    return this.routes.some((route) => {
      const match =
        route.method === request.method && this.match(route.url, path);
      if (!match) return false;

      const urlParts = match.map(decodeURIComponent);
      route.handler(request, response, ...urlParts);
      return true;
    });
  }
}
