// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  // "customTypes": [],
  dependencyTypes: [
    'dev',
    'overrides',
    'peer',
    'pnpmOverrides',
    'prod',
    'resolutions',
    'workspace',
  ],
  filter: '.',
  indent: '  ',
  semverRange: '',
  // "sortAz": [
  //   "contributors",
  //   "dependencies",
  //   "devDependencies",
  //   "keywords",
  //   "peerDependencies",
  //   "resolutions",
  //   "scripts"
  // ],
  sortFirst: ['name', 'description', 'version', 'author'],
  source: ['package.json', 'packages/*/package.json'],
  semverGroups: [
    {
      packages: ['@examples-hub/react-play-versions'],
      dependencies: ['@tanstack/react-query'],
      isIgnored: true,
    },
  ],
  versionGroups: [
    // {
    //   dependencies: ['@types/node'],
    //   packages: ['**'],
    //   pinVersion: '14.18.36',
    // },
  ],
};

module.exports = config;
