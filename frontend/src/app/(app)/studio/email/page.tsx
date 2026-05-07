'use client'

import { StudioGenerator } from '@/components/studio/studio-generator'
import { Mail } from 'lucide-react'

const config = {
  type: 'email',
  label: 'Email Graphics',
  description: 'Design on-brand email headers, hero images, and promotional graphics for your campaigns.',
  icon: Mail,
  accentColor: 'bg-emerald-500',
  settingFields: [
    {
      type: 'radio' as const,
      key: 'template_type',
      label: 'Template Type',
      options: [
        { value: 'newsletter', label: 'Newsletter' },
        { value: 'promotional', label: 'Promotional' },
        { value: 'announcement', label: 'Announcement' },
        { value: 'welcome', label: 'Welcome' },
        { value: 'event', label: 'Event Invite' },
      ],
    },
    {
      type: 'select' as const,
      key: 'width',
      label: 'Email Width',
      options: [
        { value: '600', label: '600px (Standard)' },
        { value: '700', label: '700px (Wide)' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'section',
      label: 'Graphic Section',
      options: [
        { value: 'header', label: 'Header Banner' },
        { value: 'hero', label: 'Hero Image' },
        { value: 'cta_block', label: 'CTA Block' },
        { value: 'footer', label: 'Footer' },
      ],
    },
    {
      type: 'toggle' as const,
      key: 'dark_mode',
      label: 'Dark Mode Version',
      hint: 'Generate a dark background variant',
    },
  ],
}

export default function EmailPage() {
  return <StudioGenerator config={config} />
}
