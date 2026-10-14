import ResetPasswordForm from '../../../src/components/ResetPasswordForm.js';

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
