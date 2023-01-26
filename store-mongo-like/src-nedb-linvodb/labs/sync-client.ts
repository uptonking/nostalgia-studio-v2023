import WebSocket from 'ws';

const socket = new WebSocket('ws://localhost:3000/sync/trie');

socket.addEventListener('open', () => {
  // send a message to the server
  socket.send(
    JSON.stringify({
      type: 'hello from client',
      content: [3, '4'],
    }),
  );
});

// receive a message from the server
socket.addEventListener('message', ({ data }) => {
  // @ts-expect-error fix-types
  const d = JSON.parse(data);

  console.log(';; c-msg ', d)

  // switch (packet.type) {
  //   case 'hello from server':
  //     // ...
  //     break;
  // }
});
