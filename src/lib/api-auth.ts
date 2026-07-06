import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, UserRole } from '@/lib/rbac';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Authenticate a request and return the user session
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No valid session',
        statusCode: 401
      };
    }

    return {
      success: true,
      user: session.user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed',
      statusCode: 401
    };
  }
}

/**
 * Check if user has required permission
 */
export function requirePermission(permissionName: string) {
  return async (request: NextRequest): Promise<AuthResult> => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success) {
      return authResult;
    }

    const userRole = authResult.user.role as UserRole;
    
    if (!hasPermission(userRole, permissionName)) {
      return {
        success: false,
        error: 'Forbidden - Insufficient permissions',
        statusCode: 403
      };
    }

    return authResult;
  };
}

/**
 * Check if user has one of the required roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<AuthResult> => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success) {
      return authResult;
    }

    const userRole = authResult.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      return {
        success: false,
        error: 'Forbidden - Role not authorized',
        statusCode: 403
      };
    }

    return authResult;
  };
}

/**
 * Check if user is admin
 */
export function requireAdmin() {
  return requireRole(['admin']);
}

/**
 * Check if user is admin or manager
 */
export function requireAdminOrManager() {
  return requireRole(['admin', 'manager']);
}

/**
 * Helper to handle auth errors in API routes
 */
export function handleAuthError(authResult: AuthResult): NextResponse {
  return NextResponse.json(
    { success: false, error: authResult.error },
    { status: authResult.statusCode || 401 }
  );
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success) {
      return handleAuthError(authResult);
    }

    return handler(request, authResult.user);
  };
}

/**
 * Middleware wrapper with permission check
 */
export function withPermission(permissionName: string) {
  return function(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const authResult = await requirePermission(permissionName)(request);
      
      if (!authResult.success) {
        return handleAuthError(authResult);
      }

      return handler(request, authResult.user);
    };
  };
}

/**
 * Middleware wrapper with role check
 */
export function withRole(allowedRoles: UserRole[]) {
  return function(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const authResult = await requireRole(allowedRoles)(request);
      
      if (!authResult.success) {
        return handleAuthError(authResult);
      }

      return handler(request, authResult.user);
    };
  };
}
