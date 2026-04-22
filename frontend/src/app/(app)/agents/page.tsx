'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AgentsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/agents/website-builder') }, [router])
  return null
}
