/**
 * React twin of `src/compat.ts`. The React emission copies this file over the
 * Preact shim, so component modules keep importing `./compat.js` unchanged.
 */
export { createPortal } from "react-dom";
