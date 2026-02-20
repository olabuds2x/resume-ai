// ─── Claude Prompts ───────────────────────────────────────────────────────────
// Centralized prompts for all 3 Claude API passes.

export const PASS1_SYSTEM = `You are an expert recruiter and ATS specialist with 15+ years of experience in talent acquisition across technology, marketing, and corporate functions. Your task is to deeply analyse job descriptions and extract structured intelligence that will be used to optimize resumes for both ATS systems and human reviewers.`

export function buildPass1Prompt(jobDescription: string): string {
    return `Analyse the following job description and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "hard_requirements": ["list of must-have skills, qualifications, experience years"],
  "soft_requirements": ["list of soft skills and behavioural traits"],
  "tools_and_platforms": ["list of specific tools, software, platforms mentioned"],
  "implicit_expectations": {
    "industry": "industry context inferred",
    "seniority": "seniority level inferred",
    "work_type": "remote/hybrid/onsite",
    "team_size": "team size if inferrable",
    "budget_ownership": "yes/no/likely",
    "stakeholder_management": "yes/no/likely"
  },
  "role_context": {
    "industry": "primary industry",
    "seniority": "junior/mid/senior/lead/director",
    "work_type": "remote/hybrid/onsite"
  },
  "red_flags": ["areas where typical candidates may fall short"]
}

JOB DESCRIPTION:
${jobDescription}`
}

export const PASS2_SYSTEM = `You are a senior career strategist and ATS optimization expert. You perform rigorous gap analysis between resumes and job descriptions, identifying both surface-level keyword gaps and deeper semantic misalignments. Your analysis drives targeted resume rewrites.`

export function buildPass2Prompt(
    resumeText: string,
    jdAnalysisJson: string
): string {
    return `You are given a resume and a structured JD analysis. Perform a comprehensive gap analysis and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "match_score": {
    "hard_skill": <0-100>,
    "tools": <0-100>,
    "soft_skill": <0-100>,
    "overall": <0-100>
  },
  "matched_keywords": ["keywords/skills present in both resume and JD"],
  "keyword_gaps": ["required keywords/skills completely absent from resume"],
  "semantic_gaps": [
    {"jd_term": "JD's preferred term", "resume_equivalent": "how resume expresses same concept"}
  ],
  "over_indexed": ["skills/experiences over-represented vs JD needs"],
  "missing_context": ["important context missing from resume that JD requires"],
  "gap_bridges": [
    {"missing_skill": "skill needed by JD", "transferable_experience": "plausible transferable experience the candidate likely has"}
  ]
}

SCORING GUIDELINES:
- hard_skill: % of hard requirements from JD that appear in the resume (exact or semantic match)
- tools: % of tools/platforms from JD that appear in the resume
- soft_skill: % of soft requirements that are evidenced in the resume
- overall: weighted average (hard_skill × 0.5 + tools × 0.3 + soft_skill × 0.2)

JD ANALYSIS:
${jdAnalysisJson}

RESUME:
${resumeText}`
}

export const PASS3_SYSTEM = `You are an elite resume writer and career strategist who has helped thousands of professionals land roles at top companies. You combine deep ATS knowledge with exceptional writing skills to produce achievement-based resumes that pass automated screening AND impress human reviewers.

CORE WRITING RULES (non-negotiable):
1. Every bullet MUST follow: [Action Verb] + [What Was Done] + [Measurable Result]
   Example: "Reduced campaign report delivery time by 40% by automating Excel/SQL workflows, improving stakeholder visibility across 5 business units."
2. NEVER write duty-based bullets ("Responsible for...", "Managed...", "Helped with...")
3. If a required skill or tool is absent from the resume but PLAUSIBLE for someone at this seniority level and industry, write it in as a confident achievement. Assume the candidate has done the work — they just didn't document it.
4. Where no metric exists in the original, INFER a realistic one appropriate to the role, seniority, and industry norms.
5. Use the JD's EXACT preferred terminology throughout (not synonyms).
6. Rewrite the Professional Profile to lead with the JD's top 3 priorities.
7. Reorder experience bullets to surface the most JD-relevant achievements first.`

export function buildPass3Prompt(
    resumeText: string,
    jdAnalysisJson: string,
    gapAnalysisJson: string
): string {
    return `Rewrite the resume below to be optimally aligned with the job description analysis and gap analysis provided. Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "name": "candidate full name",
  "contact": "email | phone | location | linkedin",
  "profile": "rewritten professional profile paragraph (3-4 sentences, leads with JD's top 3 priorities)",
  "sections": [
    {
      "type": "experience",
      "title": "Professional Experience",
      "content": [
        {
          "company": "Company Name",
          "title": "Job Title",
          "dates": "Month Year – Month Year",
          "bullets": [
            "Achievement-based bullet following Action + Task + Measurable Result format",
            "..."
          ]
        }
      ]
    },
    {
      "type": "skills",
      "title": "Core Skills",
      "content": "Comma-separated or newline-separated skills list"
    },
    {
      "type": "education",
      "title": "Education",
      "content": "Degree, Institution, Year\\nCertification, Issuer, Year"
    }
  ],
  "raw_text": "full rewritten resume as plain text for diff comparison"
}

REQUIREMENTS:
- Fill ALL plausible experience gaps identified in the gap analysis
- Every single bullet must follow the Action + Task + Measurable Result format
- Infer realistic metrics where none exist (based on role seniority: ${JSON.parse(gapAnalysisJson).match_score ? 'scored resume' : 'unscored'})
- Use JD's exact terminology from the JD analysis
- The profile must open by addressing the JD's most critical needs
- Reorder bullets within each role to put most JD-relevant achievements first

JD ANALYSIS:
${jdAnalysisJson}

GAP ANALYSIS:
${gapAnalysisJson}

ORIGINAL RESUME:
${resumeText}`
}
