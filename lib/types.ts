// ─── Shared TypeScript Types ─────────────────────────────────────────────────

export interface JDAnalysis {
  hard_requirements: string[]
  soft_requirements: string[]
  tools_and_platforms: string[]
  implicit_expectations: {
    industry?: string
    seniority?: string
    work_type?: string
    [key: string]: string | undefined
  }
  role_context: {
    industry: string
    seniority: string
    work_type: string
  }
}

export interface GapBridge {
  missing_skill: string
  transferable_experience: string
}

export interface SemanticGap {
  jd_term: string
  resume_equivalent: string
}

export interface GapAnalysis {
  match_score: {
    hard_skill: number
    tools: number
    soft_skill: number
    overall: number
  }
  keyword_gaps: string[]
  semantic_gaps: SemanticGap[]
  over_indexed: string[]
  missing_context: string[]
  gap_bridges: GapBridge[]
  matched_keywords: string[]
}

export interface ResumeSection {
  type:
    | 'profile'
    | 'experience'
    | 'education'
    | 'skills'
    | 'certifications'
    | 'other'
  title: string
  content: string | ResumeExperience[]
}

export interface ResumeExperience {
  company: string
  title: string
  dates: string
  bullets: string[]
}

export interface RewrittenResume {
  name: string
  contact: string
  profile: string
  sections: ResumeSection[]
  raw_text: string
}

export interface AnalyzeResponse {
  jd_analysis: JDAnalysis
  gap_analysis: GapAnalysis
  original_text: string
}

export interface RewriteResponse {
  rewritten_resume: RewrittenResume
  after_score: {
    hard_skill: number
    tools: number
    soft_skill: number
    overall: number
  }
}
