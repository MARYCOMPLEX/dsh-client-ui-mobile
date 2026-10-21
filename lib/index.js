/**
 * Host half of the mobile adaptation plugin. It contributes no host services:
 * every behaviour lives in the browser bundle reached through `exports["./client"]`.
 * The empty apply only gives the Loader a row to hang the client bundle on.
 */
export function apply() {}
