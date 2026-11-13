// The Worker and browser must use the same pinned Yjs dependency/lockfile.
// This entry lives beside package.json so normal package resolution works.
export { decodeUpdate, mergeUpdates } from 'yjs';
