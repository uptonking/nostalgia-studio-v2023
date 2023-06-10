import { JSONPatch } from './jsonPatch';
import { syncable, type SyncableClient } from './syncable';

test();

async function test() {
  const options = { blacklist: new Set(['/foos']) };

  const client1 = syncable({}, undefined, options);
  const client2 = syncable({});
  const server = syncable({}, undefined, { ...options, server: true });
  const clients = [client1, client2];

  // Control when changes are sent to test client-server interaction.
  const sendChanges = async (client: SyncableClient) => {
    const result = await client.send(async (changes) => {
      await Promise.resolve();
      return server.receive(changes);
    });
    if (result) {
      const [patch, rev, clientPatch] = result;
      client.receive(clientPatch, rev);
      if (patch.length) {
        // Can send an empty array to track the updated rev, can not send anything
        clients.forEach(
          (other) => other !== client && other.receive(patch, rev),
        );
      }
    }
  };

  client1.change(
    new JSONPatch().add('/thing', {}).add('/thing/stuff', 'green jello'),
  );
  await sendChanges(client1);
  client2.set(client1.get(), client1.getMeta());

  client1.change(
    new JSONPatch()
      .add('/test', 'out')
      .increment('/foo', 2)
      .add('/thing', { foobar: true }),
  );
  client2.change(
    new JSONPatch().increment('/foo', 5).add('/thing/asdf', 'qwer'),
  );

  await Promise.all([sendChanges(client1), sendChanges(client2)]);

  client2.change(new JSONPatch().remove('/thing/asdf').increment('/foo'));
  await sendChanges(client2);

  client2.change(new JSONPatch().add('/foos', 'bars'));
  await sendChanges(client2);

  process.stdout.write(
    [
      JSON.stringify([server.get(), server.getMeta()], null, 2),
      JSON.stringify([client1.get(), client1.getMeta()], null, 2),
      JSON.stringify([client2.get(), client2.getMeta()], null, 2),
    ].join('\n') + '\n',
  );
}
