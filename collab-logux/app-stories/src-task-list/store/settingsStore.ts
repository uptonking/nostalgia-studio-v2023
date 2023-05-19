import { action, atom, computed } from 'nanostores';

import type { Settings } from '../types/settings';

const settings = atom<Settings>({
  isOpen: false,
  useCustomFont: true,
});

const isMenuOpen = computed(
  settings,
  (currentSettings) => currentSettings.isOpen,
);

const toggleMenu = action(settings, 'toggleMenu', (store) => {
  const prevStore = store.get();
  store.set({
    isOpen: !prevStore.isOpen,
    useCustomFont: prevStore.useCustomFont,
  });
  return store.get();
});

const toggleFont = action(settings, 'toggleFont', (store) => {
  const prevStore = store.get();
  store.set({
    isOpen: prevStore.isOpen,
    useCustomFont: !prevStore.useCustomFont,
  });
  return store.get();
});

export { settings, isMenuOpen, toggleMenu, toggleFont };
