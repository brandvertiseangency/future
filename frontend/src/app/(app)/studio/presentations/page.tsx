'use client'

import { StudioGenerator } from '@/components/studio/studio-generator'
import { PresentationIcon } from 'lucide-react'

const config = {
  type: 'presentation',
  label: 'Presentation Slides',
  description: 'Generate branded slide content, outlines, and visual directions for pitch decks and company presentations.',
  icon: PresentationIcon,
  accentColor: 'bg-amber-500',
  settingFields: [
    {
      type: 'select' as const,
      key: 'slide_count',
      label: 'Number of Slides',
      options: [
        { value: '5', label: '5 slides (Summary)' },
        { value: '10', label: '10 slides (Standard)' },
        { value: '15', label: '15 slides (Detailed)' },
        { value: '20', label: '20 slides (Comprehensive)' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'style',
      label: 'Visual Style',
      options: [
        { value: 'corporate', label: 'Corporate' },
        { value: 'creative', label: 'Creative' },
        { value: 'minimal', label: 'Minimal' },
        { value: 'bold', label: 'Bold' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'aspect',
      label: 'Aspect Ratio',
      options: [
        { value: '16:9', label: '16:9 (Widescreen)' },
        { value: '4:3', label: '4:3 (Standard)' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'presentation_type',
      label: 'Presentation Type',
      options: [
        { value: 'pitch_deck', label: 'Pitch Deck' },
        { value: 'company_profile', label: 'Company Profile' },
        { value: 'product_demo', label: 'Product Demo' },
        { value: 'report', label: 'Report' },
      ],
    },
    {
      type: 'toggle' as const,
      key: 'speaker_notes',
      label: 'Include Speaker Notes',
      hint: 'Generate talking points for each slide',
    },
  ],
}

export default function PresentationsPage() {
  return <StudioGenerator config={config} />
}
