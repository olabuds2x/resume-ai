// ─── API Route: DOCX Download ─────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docxGenerator'
import type { RewrittenResume } from '@/lib/types'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { rewritten_resume }: { rewritten_resume: RewrittenResume } = body

        if (!rewritten_resume) {
            return NextResponse.json(
                { error: 'Missing rewritten_resume in request body.' },
                { status: 400 }
            )
        }

        const docxBuffer = await generateDocx(rewritten_resume)

        const filename =
            (rewritten_resume.name
                ? rewritten_resume.name.replace(/\s+/g, '_') + '_optimized'
                : 'resume_optimized') + '.docx'

        return new NextResponse(new Uint8Array(docxBuffer), {
            status: 200,
            headers: {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': docxBuffer.length.toString(),
            },
        })
    } catch (err) {
        console.error('[download] Error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
