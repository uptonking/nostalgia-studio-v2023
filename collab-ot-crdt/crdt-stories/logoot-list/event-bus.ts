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
    var body = JSON.stringify({ clientId: clientId, event: event });

    fetch('http://localhost:8089/snd', { method: 'POST', body: body });
  }

  subscribe(clientId, callback) {
    // this.subscribers.push({ clientId: clientId, callback: callback });
    var body = JSON.stringify({ clientId: clientId });

    var poll = () => {
      fetch('http://localhost:8089/rcv', { method: 'POST', body: body })
        .then((res) => res.json())
        .then((msgs) => {
          for (var idx = 0; idx < msgs.length; idx++) {
            var msg = msgs[idx];
            if (msg.clientId !== clientId) callback(msg.event);
          }
          window.setTimeout(poll, 1500);
        });
    };

    poll();
  }
}
