import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { isAdmin, isManagerOrAdmin } from './security';

export async function withAuth(request: NextRequest, handler: (request: NextRequest, session: any) => Promise<NextResponse>) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return await handler(request, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function withRoleAuth(request: NextRequest, allowedRoles: string[], handler: (request: NextRequest, session: any) => Promise<NextResponse>) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    return await handler(request, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authorization failed' },
      { status: 403 }
    );
  }
}

export async function withAdminAuth(request: NextRequest, handler: (request: NextRequest, session: any) => Promise<NextResponse>) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return await handler(request, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authorization failed' },
      { status: 403 }
    );
  }
}

export async function withManagerOrAdminAuth(request: NextRequest, handler: (request: NextRequest, session: any) => Promise<NextResponse>) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const managerCheck = await isManagerOrAdmin();
    if (!managerCheck) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Manager or admin access required' },
        { status: 403 }
      );
    }

    return await handler(request, session);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authorization failed' },
      { status: 403 }
    );
  }
}
