'use client'

import { useMemo } from 'react'

interface Props {
    originalText: string
    optimizedText: string
}

export default function DiffView({ originalText, optimizedText }: Props) {
    const originalLines = useMemo(() => originalText.split('\n').filter(l => l.trim()), [originalText])
    const optimizedLines = useMemo(() => optimizedText.split('\n').filter(l => l.trim()), [optimizedText])

    return (
        <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Before vs After</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Side-by-side comparison of original vs optimized resume</p>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span className="tag tag-matched">✓ Improved / Added</span>
                    <span className="tag tag-missing">Original content</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Original */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        📄 Original
                    </div>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 12,
                        padding: '20px',
                        maxHeight: 600,
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.7,
                    }}>
                        {originalLines.map((line, i) => (
                            <div key={i} style={{ marginBottom: 8, color: 'var(--text-secondary)', padding: '4px 8px' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Optimized */}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--success)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        ✨ Optimized
                    </div>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 12,
                        padding: '20px',
                        maxHeight: 600,
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.7,
                    }}>
                        {optimizedLines.map((line, i) => {
                            // Simple heuristic: check if line is meaningfully different
                            const isNew = !originalLines.some(orig =>
                                orig.toLowerCase().substring(0, 30) === line.toLowerCase().substring(0, 30)
                            )
                            return (
                                <div
                                    key={i}
                                    className={isNew ? 'diff-added' : ''}
                                    style={{ marginBottom: 8, color: isNew ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '4px 8px' }}
                                >
                                    {line}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 20, display: 'flex', gap: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Original lines: </span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{originalLines.length}</span>
                </div>
                <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Optimized lines: </span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--success)' }}>{optimizedLines.length}</span>
                </div>
            </div>
        </div>
    )
}
