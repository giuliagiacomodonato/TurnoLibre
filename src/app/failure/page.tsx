import { Suspense } from 'react';
import FailurePageContent from '../ui/FailurePageContent';

export default function FailurePage() {
  return (
    <Suspense fallback={null}>
      <FailurePageContent />
    </Suspense>
  );
}