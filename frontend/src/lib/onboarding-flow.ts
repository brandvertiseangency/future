import type { OnboardingData } from '@/stores/onboarding'

export type OnboardingSectionId =
  | 'welcome'
  | 'brand'
  | 'industry'
  | 'personality'
  | 'visual'
  | 'audience'
  | 'goals'
  | 'industryConfig'
  | 'references'
  | 'products'
  | 'calendar'
  | 'generate'

export interface OnboardingSection {
  id: OnboardingSectionId
  title: string
  subtitle: string
  required: boolean
}

export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  { id: 'welcome', title: 'Welcome', subtitle: 'Understand the workflow', required: false },
  { id: 'brand', title: 'Brand Brief', subtitle: 'Name, logo, positioning', required: true },
  { id: 'industry', title: 'Industry', subtitle: 'Select your market context', required: true },
  { id: 'personality', title: 'Voice', subtitle: 'Tone and content personality', required: true },
  { id: 'visual', title: 'Visual System', subtitle: 'Palette and typography', required: true },
  { id: 'audience', title: 'Audience', subtitle: 'Who content is for', required: true },
  { id: 'goals', title: 'Goals', subtitle: 'What success looks like', required: true },
  { id: 'industryConfig', title: 'Industry Module', subtitle: 'Tailored business inputs', required: true },
  { id: 'references', title: 'References', subtitle: 'Style references for AI', required: false },
  { id: 'products', title: 'Product Library', subtitle: 'Optional product intelligence', required: false },
  { id: 'calendar', title: 'Publishing Plan', subtitle: 'Frequency and channel mix', required: true },
  { id: 'generate', title: 'Generate', subtitle: 'Create your first plan', required: true },
]

export const STEP_TO_SECTION: Record<number, OnboardingSectionId> = {
  1: 'welcome',
  2: 'brand',
  3: 'industry',
  4: 'personality',
  5: 'visual',
  6: 'audience',
  7: 'goals',
  8: 'industryConfig',
  9: 'references',
  10: 'products',
  11: 'calendar',
  12: 'generate',
}

export const SECTION_TO_STEP: Record<OnboardingSectionId, number> = Object.entries(STEP_TO_SECTION).reduce(
  (acc, [step, section]) => ({ ...acc, [section]: Number(step) }),
  {} as Record<OnboardingSectionId, number>
)

export function getSectionByStep(step: number): OnboardingSection {
  const id = STEP_TO_SECTION[step] || 'welcome'
  return ONBOARDING_SECTIONS.find((s) => s.id === id) || ONBOARDING_SECTIONS[0]
}

export function getRequiredSteps(): number[] {
  return ONBOARDING_SECTIONS.filter((s) => s.required).map((s) => SECTION_TO_STEP[s.id])
}

export function getLastValidStep(step: number): number {
  return Math.min(Math.max(step, 1), ONBOARDING_SECTIONS.length)
}

export function getOnboardingProgress(step: number): number {
  return ((getLastValidStep(step) - 1) / (ONBOARDING_SECTIONS.length - 1)) * 100
}

export function inferIndustryModuleTitle(data: OnboardingData): string {
  return data.industryLabel ? `${data.industryLabel} Strategy` : 'Industry Strategy'
}
