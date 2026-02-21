// ─── DOCX Generator (ATS-Safe) ───────────────────────────────────────────────
// ATS rules: Calibri 11pt, no tables/text boxes in body, US Letter, 1-inch margins.

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    convertInchesToTwip,
    LevelFormat,
    UnderlineType
} from 'docx'
import type { RewrittenResume, ResumeSection, ResumeExperience } from './types'

const FONT = 'Calibri'
const FONT_SIZE = 22 // half-points: 22 = 11pt
const HEADING_SIZE = 24 // 12pt
const NAME_SIZE = 36 // 18pt

export async function generateDocx(resume: RewrittenResume): Promise<Buffer> {
    const children = buildChildren(resume)

    const doc = new Document({
        numbering: {
            config: [
                {
                    reference: 'bullet-list',
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.BULLET,
                            text: '\u2022',
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: {
                                        left: convertInchesToTwip(0.25),
                                        hanging: convertInchesToTwip(0.25),
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                        },
                        size: {
                            width: convertInchesToTwip(8.5),
                            height: convertInchesToTwip(11),
                        },
                    },
                },
                children,
            },
        ],
    })

    const buffer = await Packer.toBuffer(doc)
    return Buffer.from(buffer)
}

function buildChildren(resume: RewrittenResume): Paragraph[] {
    const paras: Paragraph[] = []

    // Name
    paras.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: resume.name || 'Full Name', bold: true, size: NAME_SIZE, font: FONT }),
            ],
        })
    )

    // Contact
    if (resume.contact) {
        paras.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: resume.contact, size: FONT_SIZE, font: FONT })],
            })
        )
    }

    paras.push(spacer())

    // Profile
    if (resume.profile) {
        paras.push(heading('PROFESSIONAL PROFILE'))
        paras.push(body(resume.profile))
        paras.push(spacer())
    }

    // Sections
    for (const section of resume.sections ?? []) {
        paras.push(...renderSection(section))
        paras.push(spacer())
    }

    return paras
}

function renderSection(section: ResumeSection): Paragraph[] {
    const out: Paragraph[] = [heading(section.title.toUpperCase())]

    if (section.type === 'experience' && Array.isArray(section.content)) {
        for (const exp of section.content as ResumeExperience[]) {
            out.push(...renderExperience(exp))
        }
    } else if (typeof section.content === 'string') {
        for (const line of (section.content as string).split('\n').filter(Boolean)) {
            if (line.startsWith('•') || line.startsWith('-')) {
                out.push(bullet(line.replace(/^[•\-]\s*/, '')))
            } else {
                out.push(body(line))
            }
        }
    }

    return out
}

function renderExperience(exp: ResumeExperience): Paragraph[] {
    const out: Paragraph[] = []

    // Line 1: Job Title (Bold) — extra top spacing separates roles visually
    out.push(
        new Paragraph({
            spacing: { before: 600 },
            children: [
                new TextRun({ text: exp.title || '', bold: true, size: FONT_SIZE, font: FONT }),
            ],
        })
    )

    // Line 2: Company Name (Bold)  |  Dates (Grey)
    out.push(
        new Paragraph({
            spacing: { after: 80 },
            children: [
                new TextRun({ text: exp.company || '', size: FONT_SIZE, font: FONT }),
                new TextRun({ text: `  |  ${exp.dates || ''}`, size: FONT_SIZE, font: FONT, color: '666666' }),
            ],
        })
    )

    // Bullets
    for (const b of exp.bullets ?? []) {
        out.push(bullet(b))
    }

    return out
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function heading(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 60 },
        children: [
            new TextRun({
                text,
                bold: true,
                size: HEADING_SIZE,
                font: FONT,
                underline: { type: UnderlineType.SINGLE },
            }),
        ],
    })
}

function body(text: string): Paragraph {
    return new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text, size: FONT_SIZE, font: FONT })],
    })
}

function bullet(text: string): Paragraph {
    return new Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        spacing: { after: 80 },
        children: [new TextRun({ text, size: FONT_SIZE, font: FONT })],
    })
}

function spacer(): Paragraph {
    return new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: '', size: FONT_SIZE })],
    })
}
