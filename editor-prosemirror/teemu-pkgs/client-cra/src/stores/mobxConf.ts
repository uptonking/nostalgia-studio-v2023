import { configure } from 'mobx';

const settings = { enforceActions: 'observed' as const };

export const confMobx = () => configure(settings);
