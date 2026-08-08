// Admin notifications use the same API as donors — the PHP backend
// scopes results by session user_id, so this is correct.
// This simply re-exports the donor Notifications component to avoid duplication.
export { default } from '../donor/Notifications'
