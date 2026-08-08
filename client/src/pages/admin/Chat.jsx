// Admin chat uses the same API as donors — the PHP backend scopes
// conversations by session user_id, so this is correct.
// This simply re-exports the donor Chat component to avoid duplication.
export { default } from '../donor/Chat'
