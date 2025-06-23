import { Suspense } from 'react';
import PendingPageContent from './PendingPageContent';

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <PendingPageContent />
    </Suspense>
  );
}