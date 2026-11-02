// jsdom has no matchMedia. This stand-in answers "(prefers-color-scheme: dark)" from a flag that
// tests can flip with setSystemDark(), and notifies change listeners like a real MediaQueryList.
type Listener = (event: MediaQueryListEvent) => void;

let systemDark = false;
const subscribed = new Set<FakeMediaQueryList>();
const isDarkQuery = (media: string) => media.includes('prefers-color-scheme: dark');

class FakeMediaQueryList {
  readonly listeners = new Set<Listener>();
  onchange: Listener | null = null;
  constructor(readonly media: string) {}
  get matches() {
    return isDarkQuery(this.media) ? systemDark : false;
  }
  addEventListener(_type: 'change', listener: Listener) {
    this.listeners.add(listener);
    subscribed.add(this);
  }
  removeEventListener(_type: 'change', listener: Listener) {
    this.listeners.delete(listener);
  }
  addListener(listener: Listener) {
    this.addEventListener('change', listener);
  }
  removeListener(listener: Listener) {
    this.removeEventListener('change', listener);
  }
  dispatchEvent() {
    return true;
  }
}

export function installMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => new FakeMediaQueryList(query),
  });
}

/** Changes the simulated OS preference and notifies listeners. Wrap in act() in React tests. */
export function setSystemDark(value: boolean) {
  systemDark = value;
  for (const list of subscribed) {
    if (!isDarkQuery(list.media)) continue;
    const event = { matches: value, media: list.media } as MediaQueryListEvent;
    for (const listener of list.listeners) listener(event);
  }
}

export function resetMedia() {
  systemDark = false;
  subscribed.clear();
}
