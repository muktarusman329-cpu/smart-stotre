// Re-export from middleware to avoid duplication
export {
  authenticateRequest,
  handleAuthError,
  withAuth,
  withPermission,
  withRole,
  withAdmin,
  withManagerOrAdmin,
  type AuthResult,
} from './middleware';
