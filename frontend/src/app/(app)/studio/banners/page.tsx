'use client'

import { StudioGenerator } from '@/components/studio/studio-generator'
import { Layout } from 'lucide-react'

const config = {
  type: 'banner',
  label: 'Social Banners',
  description: 'Create perfectly-sized profile banners and cover images for every social platform.',
  icon: Layout,
  accentColor: 'bg-blue-500',
  settingFields: [
    {
      type: 'select' as const,
      key: 'banner_type',
      label: 'Banner Type',
      options: [
        { value: 'facebook_cover', label: 'Facebook Cover (820 × 312px)' },
        { value: 'linkedin_banner', label: 'LinkedIn Banner (1584 × 396px)' },
        { value: 'twitter_header', label: 'Twitter / X Header (1500 × 500px)' },
        { value: 'youtube_art', label: 'YouTube Channel Art (2560 × 1440px)' },
        { value: 'instagram_highlight', label: 'Instagram Highlight Cover (1080 × 1920px)' },
      ],
    },
    {
      type: 'radio' as const,
      key: 'style',
      label: 'Style',
      options: [
        { value: 'branded', label: 'Branded' },
        { value: 'photo', label: 'Photo-led' },
        { value: 'abstract', label: 'Abstract' },
        { value: 'text_only', label: 'Text Only' },
      ],
    },
    {
      type: 'toggle' as const,
      key: 'include_logo',
      label: 'Include Brand Logo',
      hint: 'Overlay your brand logo on the banner',
    },
    {
      type: 'toggle' as const,
      key: 'include_tagline',
      label: 'Include Tagline',
      hint: 'Add your brand tagline or slogan',
    },
  ],
}

export default function BannersPage() {
  return <StudioGenerator config={config} />
}
