'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { apiCall } from '@/lib/api'
import { CONTENT_POLICY_VERSION } from '@/lib/content-policy'

type MeUser = {
  content_policy_version?: string | null
  content_policy_accepted_at?: string | null
}

export function ContentPolicyModal() {
  const { data, mutate } = useSWR(
    '/api/users/me',
    (url: string) => apiCall<{ user?: MeUser }>(url),
    { revalidateOnFocus: false }
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = data?.user

  const needsAccept =
    !!user &&
    (!user.content_policy_accepted_at || user.content_policy_version !== CONTENT_POLICY_VERSION)

  const accept = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await apiCall('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          accept_content_policy: true,
          content_policy_version: CONTENT_POLICY_VERSION,
        }),
      })
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save acceptance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!needsAccept) return null

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acceptable use</DialogTitle>
          <DialogDescription className="text-left text-[#6B7280]">
            Brandvertise generates user-directed AI images. To continue, confirm you have read our{' '}
            <Link href="/legal/acceptable-use" className="font-medium text-[#111111] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Acceptable Use Policy
            </Link>{' '}
            and will not use the product for unlawful synthetic media, including non-consensual intimate imagery or deceptive deepfakes.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-[#6B7280]">
          Report concerns anytime from{' '}
          <Link href="/legal/report-content" className="font-medium text-[#111111] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            Report content
          </Link>
          .
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" onClick={accept} disabled={submitting}>
            {submitting ? 'Saving…' : 'I agree — continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
