'use client'

import { StudioGenerator } from '@/components/studio/studio-generator'
import { Printer } from 'lucide-react'

const config = {
  type: 'print',
  label: 'Printing Assets',
  description: 'Create professional print-ready materials — flyers, brochures, and banners — tailored to your brand.',
  icon: Printer,
  accentColor: 'bg-orange-500',
  settingFields: [
    {
      type: 'radio' as const,
      key: 'use_case',
      label: 'Use Case',
      options: [
        { value: 'flyer', label: 'Flyer' },
        { value: 'brochure', label: 'Brochure' },
        { value: 'banner', label: 'Banner' },
        { value: 'poster', label: 'Poster' },
      ],
    },
    {
      type: 'select' as const,
      key: 'dimensions',
      label: 'Paper Size',
      options: [
        { value: 'a4', label: 'A4 (210 × 297mm)' },
        { value: 'a5', label: 'A5 (148 × 210mm)' },
        { value: 'a3', label: 'A3 (297 × 420mm)' },
        { value: 'letter', label: 'Letter (8.5 × 11in)' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'orientation',
      label: 'Orientation',
      options: [
        { value: 'portrait', label: 'Portrait' },
        { value: 'landscape', label: 'Landscape' },
      ],
    },
    {
      type: 'toggle' as const,
      key: 'bleed',
      label: 'Include Bleed',
      hint: 'Add 3mm bleed for professional printing',
    },
    {
      type: 'select' as const,
      key: 'file_format',
      label: 'Output Format',
      options: [
        { value: 'png', label: 'PNG (Screen / Digital)' },
        { value: 'pdf', label: 'PDF (Print-ready)' },
      ],
    },
  ],
}

export default function PrintPage() {
  return <StudioGenerator config={config} />
}
