import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDetailsForm } from '@/components/profile/ProfileDetailsForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { AppearanceSettings } from '@/components/profile/AppearanceSettings';

export default async function ProfilePage() {
  const session = getCurrentUser();
  if (!session) redirect('/login');

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileHeader name={user.name} email={user.email} avatar={user.avatar} coverImage={user.coverImage} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProfileDetailsForm initialName={user.name} initialBio={user.bio ?? ''} />
        </div>
        <PasswordChangeForm />
        <AppearanceSettings />
      </div>
    </div>
  );
}
