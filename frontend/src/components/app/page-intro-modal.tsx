'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const INTRO_VERSION = 'v2'

export function PageIntroModal({
  pageKey,
  title,
  description,
}: {
  pageKey: string
  title: string
  description: string
}) {
  const storageKey = useMemo(() => `intro_seen:${INTRO_VERSION}:${pageKey}`, [pageKey])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem(storageKey)
    if (!seen) setOpen(true)
  }, [storageKey])

  const dismiss = () => {
    setOpen(false)
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, '1')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-white border-t border-[#E5E7EB]">
          <Button onClick={dismiss} className="w-full">Get started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
