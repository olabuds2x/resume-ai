// ─── API Route: Upload + Pass 1 + Pass 2 ─────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { parseResumeBuffer } from '@/lib/parsers'
import {
    PASS1_SYSTEM,
    buildPass1Prompt,
    PASS2_SYSTEM,
    buildPass2Prompt,
} from '@/lib/prompts'
import type { JDAnalysis, GapAnalysis } from '@/lib/types'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('resume') as File | null
        const jobDescription = formData.get('jobDescription') as string | null

        if (!jobDescription?.trim()) {
            return NextResponse.json(
                { error: 'Job description is required.' },
                { status: 400 }
            )
        }

        // ── Parse resume text ────────────────────────────────────────────────────
        let resumeText = ''
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            resumeText = await parseResumeBuffer(buffer, file.type, file.name)
        } else {
            const pastedText = formData.get('resumeText') as string | null
            if (!pastedText?.trim()) {
                return NextResponse.json(
                    { error: 'Please upload a resume file or paste resume text.' },
                    { status: 400 }
                )
            }
            resumeText = pastedText
        }

        if (resumeText.length < 50) {
            return NextResponse.json(
                { error: 'Resume text too short. Please check your file.' },
                { status: 400 }
            )
        }

        // ── Pass 1: JD Deconstruction ─────────────────────────────────────────────
        const pass1Response = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 2000,
            system: PASS1_SYSTEM,
            messages: [
                {
                    role: 'user',
                    content: buildPass1Prompt(jobDescription),
                },
            ],
        })

        const pass1Text =
            pass1Response.content[0].type === 'text'
                ? pass1Response.content[0].text
                : ''

        let jdAnalysis: JDAnalysis
        try {
            const jsonMatch = pass1Text.match(/\{[\s\S]*\}/)
            jdAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : pass1Text)
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse JD analysis. Please try again.' },
                { status: 500 }
            )
        }

        // ── Pass 2: Gap Analysis ──────────────────────────────────────────────────
        const pass2Response = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 3000,
            system: PASS2_SYSTEM,
            messages: [
                {
                    role: 'user',
                    content: buildPass2Prompt(resumeText, JSON.stringify(jdAnalysis, null, 2)),
                },
            ],
        })

        const pass2Text =
            pass2Response.content[0].type === 'text'
                ? pass2Response.content[0].text
                : ''

        let gapAnalysis: GapAnalysis
        try {
            const jsonMatch = pass2Text.match(/\{[\s\S]*\}/)
            gapAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : pass2Text)
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse gap analysis. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            jd_analysis: jdAnalysis,
            gap_analysis: gapAnalysis,
            original_text: resumeText,
            job_description: jobDescription,
        })
    } catch (err) {
        console.error('[analyze] Error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
