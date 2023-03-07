import { Doc } from './doc';
import { TextareaMonitor } from './element-monitor';
import { EventBus } from './event-bus';
import { Site } from './site';
import { genRandomIntExclusive } from './utils';

const doc1 = new Doc('doc1');
const site = new Site(genRandomIntExclusive(1, 100));

const eventBus = new EventBus();

const editorElem = document.querySelector('#editor') as HTMLTextAreaElement;

const monitor = new TextareaMonitor(editorElem, (change) => {
  let op;

  if (change[0] === 'del') {
    op = site.genDel(doc1, change[1]);
  } else {
    op = site.genIns(doc1, change[1], change[2]);
  }

  site.rcvOp(doc1, op, () => {
    console.log(';; op-pub ', op)
    eventBus.publish(site.id, { op });
  });
});

eventBus.subscribe(site.id, (event) => {
  site.rcvOp(doc1, event.op, () => {
    editorElem.value = doc1.string;
    monitor.resync();
  });
});

editorElem.value = doc1.string;

monitor.resync();
monitor.monitor();


window['doc'] = doc1;
