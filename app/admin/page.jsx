import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminProducts from '../../src/components/AdminProducts.js';
import { getSessionUser, SESSION_COOKIE } from '../../src/lib/auth.js';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  let user;

  try {
    user = getSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
  } catch (error) {
    console.error('Unable to verify admin session:', error);
    throw error;
  }

  if (!user) redirect('/login?next=%2Fadmin');
  if (user.role !== 'ADMIN') redirect('/');

  return <AdminProducts />;
}
