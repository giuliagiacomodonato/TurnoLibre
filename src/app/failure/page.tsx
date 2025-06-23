import { Suspense } from 'react';
import FailurePageContent from './FailurePageContent';

export default function FailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <FailurePageContent />
    </Suspense>
  );
}