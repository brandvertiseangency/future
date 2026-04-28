import { create } from 'zustand'

export interface OutputCard {
  id: string
  imageUrl?: string
  platform: string
  contentType: string
  caption: string
  hashtags: string[]
  status: 'new' | 'saved' | 'scheduled'
  scheduledAt?: string
  feedback?: number
}

export interface GenerationForm {
  contentType: 'post' | 'carousel' | 'reel' | 'story'
  platforms: string[]
  brief: string
  mood: string
  textOverlay: boolean
  fontStyle: string
  referenceImageUrls: string[]
  selectedProductId: string | null   // brand product to feature
}

interface GenerationStore {
  form: GenerationForm
  outputs: OutputCard[]
  isGenerating: boolean
  jobId: string | null
  setForm: (partial: Partial<GenerationForm>) => void
  addOutput: (card: OutputCard) => void
  updateOutput: (id: string, partial: Partial<OutputCard>) => void
  setOutputs: (cards: OutputCard[]) => void
  setGenerating: (b: boolean) => void
  setJobId: (id: string | null) => void
  reset: () => void
}

const defaultForm: GenerationForm = {
  contentType: 'post',
  platforms: [],
  brief: '',
  mood: '',
  textOverlay: true,
  fontStyle: 'minimal',
  referenceImageUrls: [],
  selectedProductId: null,
}

export const useGenerationStore = create<GenerationStore>()((set) => ({
  form: defaultForm,
  outputs: [],
  isGenerating: false,
  jobId: null,
  setForm: (partial) =>
    set((state) => ({ form: { ...state.form, ...partial } })),
  addOutput: (card) =>
    set((state) => ({ outputs: [card, ...state.outputs] })),
  updateOutput: (id, partial) =>
    set((state) => ({
      outputs: state.outputs.map((o) => (o.id === id ? { ...o, ...partial } : o)),
    })),
  setOutputs: (cards) => set({ outputs: cards }),
  setGenerating: (b) => set({ isGenerating: b }),
  setJobId: (id) => set({ jobId: id }),
  reset: () => set({ form: defaultForm, outputs: [], isGenerating: false, jobId: null }),
}))
