'use client'

import { StudioGenerator } from '@/components/studio/studio-generator'
import { Layers } from 'lucide-react'

const config = {
  type: 'poster',
  label: 'Digital Posters',
  description: 'Design eye-catching digital posters for events, announcements, and promotions.',
  icon: Layers,
  accentColor: 'bg-violet-500',
  settingFields: [
    {
      type: 'radio' as const,
      key: 'size',
      label: 'Size',
      options: [
        { value: 'portrait', label: 'Portrait (4:5)' },
        { value: 'landscape', label: 'Landscape (16:9)' },
        { value: 'square', label: 'Square (1:1)' },
      ],
    },
    {
      type: 'select' as const,
      key: 'resolution',
      label: 'Resolution',
      options: [
        { value: '72', label: '72 dpi (Web / Screen)' },
        { value: '150', label: '150 dpi (Standard Print)' },
        { value: '300', label: '300 dpi (High-res Print)' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'theme',
      label: 'Visual Theme',
      options: [
        { value: 'minimal', label: 'Minimal' },
        { value: 'bold', label: 'Bold' },
        { value: 'festive', label: 'Festive' },
        { value: 'elegant', label: 'Elegant' },
      ],
    },
    {
      type: 'toggle' as const,
      key: 'include_cta',
      label: 'Include Call-to-Action',
      hint: 'Add a prominent CTA button or text',
    },
  ],
}

export default function PostersPage() {
  return <StudioGenerator config={config} />
}
