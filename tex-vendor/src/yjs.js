// Browser-local Yjs CRDT runtime, bundled once and served from AERTEX Work.
export {
  Doc,
  applyUpdate,
  encodeStateAsUpdate,
  encodeRelativePosition,
  decodeRelativePosition,
  createRelativePositionFromTypeIndex,
  createAbsolutePositionFromRelativePosition
} from "yjs";
