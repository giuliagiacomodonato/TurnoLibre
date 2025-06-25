import { Suspense } from 'react';
import PendingPageContent from '../ui/PendingPageContent';

export default function PendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingPageContent />
    </Suspense>
  );
}