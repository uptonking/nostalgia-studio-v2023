import { type Watarble } from './watarble';

let counter = 0;

function generateId() {
  return ++counter;
}

interface Instances {
  watarble: Watarble;
  // dataProvider: DataProvider;
}

const instances: Record<string, Instances> = {};

export function registerInstance(instance: Watarble, id?: string) {
  if (id) {
    counter++;
    id = 'WTBL_' + id;
  } else {
    id = 'WTBL_' + generateId();
  }

  if (!instances[id]) {
    instances[id] = {
      watarble: instance,
    };
  }

  return id;
}

export function getInstance(id: string): Watarble {
  return instances[id].watarble;
}
