import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { LegalDocumentRenderer } from '@/components/legal/LegalDocumentRenderer'
import { LEGAL_CONTENT } from '@/data/legal-content'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <LegalLayout title="Terms of Service" lastUpdated={currentDate}>
      <LegalDocumentRenderer content={LEGAL_CONTENT.terms} />
    </LegalLayout>
  )
}
