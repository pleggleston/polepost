import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { getCurrentUser } from '@/lib/auth/session';

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/');
  }

  return <SignupForm />;
}
