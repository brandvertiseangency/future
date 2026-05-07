'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [localAccepted, setLocalAccepted] = useState(false)
  const user = data?.user
  const localKey = useMemo(() => `bv.content_policy.accepted.${CONTENT_POLICY_VERSION}`, [])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(localKey)
      setLocalAccepted(stored === '1')
    } catch {
      setLocalAccepted(false)
    }
  }, [localKey])

  const needsAccept =
    !!user &&
    !localAccepted &&
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
      try {
        window.localStorage.setItem(localKey, '1')
      } catch {}
      setLocalAccepted(true)
      await mutate()
    } catch (e) {
      const fallbackHost =
        typeof window !== 'undefined' &&
        ['localhost', '127.0.0.1'].includes(window.location.hostname)
      if (fallbackHost) {
        try {
          window.localStorage.setItem(localKey, '1')
        } catch {}
        setLocalAccepted(true)
        setError('Could not sync acceptance to API, but continued locally for development.')
        return
      }
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
