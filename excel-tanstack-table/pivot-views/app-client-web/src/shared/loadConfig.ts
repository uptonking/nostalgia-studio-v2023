import axios from 'axios';

import type { ClientConfig } from '@datalking/pivot-app-shared-lib';

import { patch } from '../features/app';
import config from './config';
import store from './store';

/** fetch config from server */
export async function loadConfig() {
  // Remote config
  const serverConfig = (await axios.get('/config'))?.data;
  if (!serverConfig) {
    return;
  }
  setConfig(serverConfig);
}
export default loadConfig;

export function setConfig(payload: ClientConfig) {
  const fromServer = payload as unknown as { [key: string]: unknown };
  // update config - TODO, reduce or remove config
  const indexed = config as unknown as { [key: string]: unknown };
  Object.keys(fromServer).forEach((key: string) => {
    if (typeof fromServer[key] === 'object') {
      indexed[key] = {
        ...(indexed[key] as { [key: string]: unknown }),
        ...(fromServer[key] as object),
      };
    } else {
      indexed[key] = fromServer[key];
    }
  });
  // update state
  store.dispatch(
    patch({
      ...fromServer,
      loaded: true,
    }),
  );
  return fromServer;
}
