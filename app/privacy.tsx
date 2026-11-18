import { LegalDraftPage } from '@/components/legal/LegalDraftPage';

export default function PrivacyScreen() {
  return (
    <LegalDraftPage
      title="Privacy Policy"
      willCover={[
        'What information the app collects and why',
        'How your learning data is stored and protected',
        'How research participation is handled separately from your account',
        'How to access, correct or delete your information',
        'How to contact the project team about privacy',
      ]}
    />
  );
}
