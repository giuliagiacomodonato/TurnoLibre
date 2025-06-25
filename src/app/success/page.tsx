import { Suspense } from 'react';
import SuccessPageContent from '../ui/SuccessPageContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessPageContent />
    </Suspense>
  );
}