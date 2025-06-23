import { Suspense } from 'react';
import PendingPageContent from './PendingPageContent';

export default function PendingPage() {
  return (
    <Suspense>
      <PendingPageContent />
    </Suspense>
  );
} 