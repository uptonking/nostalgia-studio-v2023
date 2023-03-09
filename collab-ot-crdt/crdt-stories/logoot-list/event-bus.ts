export class EventBus {
  subscribers: any[];

  constructor() {
    this.subscribers = [];
  }

  publish(clientId, event) {
    // for (var idx = 0; idx < this.subscribers.length; idx++) {
    //   var subscriber = this.subscribers[idx]
    //   if (subscriber.clientId !== clientId) {
    //     var eventClone = JSON.parse(JSON.stringify(event));
    //     subscriber.callback(eventClone);
    //   }
    // }
    const body = JSON.stringify({ clientId: clientId, event: event });
    console.log(';; op-pub ', event);

    fetch('http://localhost:8089/snd', { method: 'POST', body: body });
  }

  subscribe(clientId, callback) {
    // this.subscribers.push({ clientId: clientId, callback: callback });
    const body = JSON.stringify({ clientId: clientId });

    const poll = () => {
      fetch('http://localhost:8089/rcv', { method: 'POST', body: body })
        .then((res) => res.json())
        .then((msgs) => {
          for (let idx = 0; idx < msgs.length; idx++) {
            const msg = msgs[idx];
            console.log(';; op-sub ', msg.event);
            if (msg.clientId !== clientId) callback(msg.event);
          }
          window.setTimeout(poll, 1500);
        });
    };

    poll();
  }
}
