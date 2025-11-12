import { NextResponse } from 'next/server';
import { getAdminStatus } from '@/lib/admin';

export async function GET() {
  try {
    const adminStatus = await getAdminStatus();

    if (!adminStatus) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({
      isAdmin: adminStatus.isAdmin,
      userId: adminStatus.userId,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
