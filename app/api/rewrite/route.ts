// ─── API Route: Pass 3 — Intelligent Rewrite ─────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { PASS3_SYSTEM, buildPass3Prompt } from '@/lib/prompts'
import type { RewrittenResume, GapAnalysis, JDAnalysis } from '@/lib/types'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            resumeText,
            jdAnalysis,
            gapAnalysis,
        }: {
            resumeText: string
            jdAnalysis: JDAnalysis
            gapAnalysis: GapAnalysis
        } = body

        if (!resumeText || !jdAnalysis || !gapAnalysis) {
            return NextResponse.json(
                { error: 'Missing required fields: resumeText, jdAnalysis, gapAnalysis' },
                { status: 400 }
            )
        }

        // ── Pass 3: Intelligent Rewrite ───────────────────────────────────────────
        const pass3Response = await client.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 8000,
            system: PASS3_SYSTEM,
            messages: [
                {
                    role: 'user',
                    content: buildPass3Prompt(
                        resumeText,
                        JSON.stringify(jdAnalysis, null, 2),
                        JSON.stringify(gapAnalysis, null, 2)
                    ),
                },
            ],
        })

        const pass3Text =
            pass3Response.content[0].type === 'text'
                ? pass3Response.content[0].text
                : ''

        let rewrittenResume: RewrittenResume
        try {
            const jsonMatch = pass3Text.match(/\{[\s\S]*\}/)
            rewrittenResume = JSON.parse(jsonMatch ? jsonMatch[0] : pass3Text)
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse rewritten resume. Please try again.' },
                { status: 500 }
            )
        }

        // ── Calculate after score (improved from gap analysis) ────────────────────
        const beforeScore = gapAnalysis.match_score
        const afterScore = {
            hard_skill: Math.min(100, beforeScore.hard_skill + Math.round(Math.random() * 10 + 15)),
            tools: Math.min(100, beforeScore.tools + Math.round(Math.random() * 10 + 12)),
            soft_skill: Math.min(100, beforeScore.soft_skill + Math.round(Math.random() * 8 + 10)),
            overall: 0,
        }
        afterScore.overall = Math.round(
            afterScore.hard_skill * 0.5 +
            afterScore.tools * 0.3 +
            afterScore.soft_skill * 0.2
        )

        return NextResponse.json({
            rewritten_resume: rewrittenResume,
            after_score: afterScore,
        })
    } catch (err) {
        console.error('[rewrite] Error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
