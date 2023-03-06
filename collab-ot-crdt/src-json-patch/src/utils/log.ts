let displayLogs = false;

export function verbose(value: boolean) {
  displayLogs = value;
}

export function log(...rest: any[]) {
  displayLogs && console.log(...rest);
}
