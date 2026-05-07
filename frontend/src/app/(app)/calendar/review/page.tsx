'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ReviewRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')

  useEffect(() => {
    router.replace(planId ? `/calendar?planId=${planId}` : '/calendar')
  }, [router, planId])

  return null
}

export default function CalendarReviewPage() {
  return (
    <Suspense>
      <ReviewRedirect />
    </Suspense>
  )
}
