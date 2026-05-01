import { z } from 'zod'
import { INDUSTRY_QUESTIONS } from '@/lib/industry-questions'
import type { OnboardingData } from '@/stores/onboarding'

export const brandSchema = z.object({
  brandName: z.string().trim().min(2, 'Brand name is required'),
  description: z.string().trim().min(10, 'Add a short positioning description'),
})

export const industrySchema = z.object({
  industry: z.string().trim().min(1, 'Select an industry'),
})

export const personalitySchema = z.object({
  tone: z.number().min(0).max(100),
  vibeStyles: z.array(z.string()).min(1, 'Pick at least one brand vibe'),
})

export const visualSchema = z.object({
  colorPrimary: z.string().trim().min(4),
  colorSecondary: z.string().trim().min(4),
  fontMood: z.string().nullable(),
})

export const audienceSchema = z.object({
  audienceAgeMin: z.number().min(18),
  audienceAgeMax: z.number().max(65),
  audienceCity: z.string().trim().min(2, 'Audience location is required'),
  audienceLifestyle: z.array(z.string()).min(1, 'Add at least one audience attribute'),
})

export const goalsSchema = z.object({
  goals: z.array(z.string()).min(1, 'Pick at least one goal'),
})

export const calendarSchema = z
  .object({
    activePlatforms: z.array(z.string()).min(1, 'Select at least one active platform'),
    weeklyPostCount: z.number().min(1),
    contentMix: z.object({
      promotional: z.number(),
      educational: z.number(),
      testimonial: z.number(),
      bts: z.number(),
      festive: z.number(),
    }),
  })
  .superRefine((value, ctx) => {
    const total = Object.values(value.contentMix).reduce((a, b) => a + b, 0)
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Content mix must add up to 100',
        path: ['contentMix'],
      })
    }
  })

export function validateIndustryAnswers(data: OnboardingData): { valid: boolean; missingKeys: string[] } {
  const questions = INDUSTRY_QUESTIONS[data.industry] || INDUSTRY_QUESTIONS.other
  const missingKeys = questions
    .filter((q) => q.required)
    .filter((q) => {
      const value = data.industryAnswers?.[q.key]
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'string') return !value.trim()
      if (typeof value === 'number') return Number.isNaN(value)
      if (typeof value === 'boolean') return false
      return !value
    })
    .map((q) => q.key)
  return { valid: missingKeys.length === 0, missingKeys }
}

export function getSectionValidity(data: OnboardingData) {
  const industryAnswers = validateIndustryAnswers(data)
  return {
    brand: brandSchema.safeParse(data).success,
    industry: industrySchema.safeParse(data).success,
    personality: personalitySchema.safeParse(data).success,
    visual: visualSchema.safeParse(data).success,
    audience: audienceSchema.safeParse(data).success,
    goals: goalsSchema.safeParse(data).success,
    industryConfig: industryAnswers.valid,
    calendar: calendarSchema.safeParse(data).success,
  }
}
