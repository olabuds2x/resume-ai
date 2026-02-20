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
    // pdfjs-dist requires the legacy build for Node.js environments
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)

    const uint8Array = new Uint8Array(buffer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadingTask = (pdfjsLib as any).getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    const textPages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
            .map((item: { str?: string }) => item.str ?? '')
            .join(' ')
        textPages.push(pageText)
    }

    return textPages.join('\n\n').trim()
}

async function parseDocx(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
}
