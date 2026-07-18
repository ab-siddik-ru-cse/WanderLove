import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { CustomFieldManager } from '@/components/settings/CustomFieldManager';
import { PackingTemplateEditor } from '@/components/settings/PackingTemplateEditor';
import { CoupleAndSplitSettings } from '@/components/settings/CoupleAndSplitSettings';

export default async function SettingsPage() {
  const session = getCurrentUser();
  await connectDB();
  const user = session ? await User.findById(session.userId).lean() : null;

  let partnerName: string | null = null;
  if (user?.partnerId) {
    const partner = await User.findById(user.partnerId).lean();
    partnerName = partner?.name ?? null;
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Couple Admin Control Hub</h1>
        <p className="text-sm text-ink/50">Everything that shapes how WanderLove looks and behaves for you two.</p>
      </div>

      <CoupleAndSplitSettings
        hasPartner={Boolean(user.partnerId)}
        partnerName={partnerName}
        initialSplitRule={user.preferences.defaultSplitRule}
      />
      <ThemeCustomizer initialTheme={user.preferences.theme} />
      <CategoryManager initialCategories={user.preferences.customCategories} />
      <CustomFieldManager initialFields={user.preferences.customActivityFields} />
      <PackingTemplateEditor initialTemplates={user.preferences.packingTemplates} />
    </div>
  );
}
