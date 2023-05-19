import { atom, onMount } from 'nanostores';

import { badge, badgeEn, confirm, CrossTabClient, log } from '@logux/client';
import { badgeStyles } from '@logux/client/badge/styles';
import { Client } from '@logux/client/client';

import { subprotocol } from '../../protocol/index';
import { authStore, logout } from './auth';

const loguxServer = `${
  window.location.protocol.endsWith('s') ? 'wss' : 'ws'
}://${window.location.host}/logux`;

const fakeClient = new CrossTabClient({
  subprotocol,
  userId: '',
  server: loguxServer,
  allowDangerousProtocol: true,
});

// @ts-expect-error fix-types
export const clientStore = atom<Client>(fakeClient);

onMount(clientStore, () => {
  const client = new CrossTabClient({
    subprotocol,
    userId: '',
    server: loguxServer,
    allowDangerousProtocol: true,
  });

  // @ts-expect-error fix-types
  badge(client, { messages: badgeEn, styles: badgeStyles });
  // @ts-expect-error fix-types
  log(client);
  // @ts-expect-error fix-types
  confirm(client);

  let started = false;

  // @ts-expect-error fix-types
  clientStore.set(client);

  let authUnsubscribe = authStore.subscribe(({ id }, changedKey) => {
    if (!changedKey) {
      if (id) {
        client.changeUser(id);

        if (started) {
          client.node.connection.connect();
        } else {
          client.start();
          started = true;
        }
      } else if (client.node.connected) {
        client.node.connection.disconnect();
        client.changeUser('');
      }
    }
  });

  client.node.catch((error) => {
    if (error.type === 'wrong-credentials') {
      logout();
    }
  });

  return () => {
    authUnsubscribe();
    client.destroy();
  };
});
