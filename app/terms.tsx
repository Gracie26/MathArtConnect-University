import { LegalDraftPage } from '@/components/legal/LegalDraftPage';

export default function TermsScreen() {
  return (
    <LegalDraftPage
      title="Terms of Use"
      willCover={[
        'Who may use the app and how accounts work',
        'Acceptable use of the app and its learning content',
        'Ownership of content you create in the app',
        'Availability, changes and ending your account',
        'How to contact the project team',
      ]}
    />
  );
}
