// ─── File Parsers: PDF + DOCX → Plain Text ───────────────────────────────────
// All processing is done in memory — nothing is persisted to disk.

/**
 * Extracts raw text from an uploaded resume file (PDF, DOCX, or TXT).
 * Runs server-side inside a Next.js API route.
 */
export async function parseResumeBuffer(
    buffer: Buffer,
    mimeType: string,
    filename: string
): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase()

    if (ext === 'pdf' || mimeType === 'application/pdf') {
        return parsePdf(buffer)
    } else if (
        ext === 'docx' ||
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        return parseDocx(buffer)
    } else if (ext === 'txt' || mimeType === 'text/plain') {
        return buffer.toString('utf-8')
    }

    throw new Error(
        `Unsupported file type: ${ext ?? mimeType}. Please upload PDF, DOCX, or TXT.`
    )
}

async function parsePdf(buffer: Buffer): Promise<string> {
    // Import the internal module directly to bypass pdf-parse's self-test,
    // which tries to open ./test/data/05-versions-space.pdf and crashes on Vercel.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js')
    const data = await pdfParse(buffer)
    return data.text
}

async function parseDocx(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
}
