'use client'

import { useRouter } from 'next/navigation'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { BrandIdentityEditor } from '@/components/brand/brand-identity-editor'

export default function BrandEditPage() {
  const router = useRouter()

  return (
    <PageContainer className="max-w-5xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          variant="compact"
          title={
            <>
              Brand <span className="text-highlight">setup</span>
            </>
          }
          description="Edit identity, audience, visuals, and channel defaults. Changes apply across the studio, calendar, and agents."
        />
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push('/brand')}>
            Discard
          </Button>
          <Button
            type="button"
            onClick={() => (document.getElementById('brand-identity-form') as HTMLFormElement | null)?.requestSubmit()}
          >
            Save brand
          </Button>
        </div>
      </div>
      <BrandIdentityEditor embedded variant="tabbed" />
    </PageContainer>
  )
}
