'use client'

import type { GapAnalysis, JDAnalysis } from '@/lib/types'

interface Props {
    gapAnalysis: GapAnalysis
    jdAnalysis: JDAnalysis
}

export default function KeywordTable({ gapAnalysis, jdAnalysis }: Props) {
    const matched = gapAnalysis.matched_keywords ?? []
    const missing = gapAnalysis.keyword_gaps ?? []
    const bridged = gapAnalysis.gap_bridges?.map(b => b.missing_skill) ?? []
    const semantic = gapAnalysis.semantic_gaps ?? []

    return (
        <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Keyword Analysis</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
                How your resume aligns with the job description requirements
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
                {/* Matched */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--success)' }}>Matched ({matched.length})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {matched.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None identified</span>
                        ) : matched.map(k => (
                            <span key={k} className="tag tag-matched">{k}</span>
                        ))}
                    </div>
                </div>

                {/* Missing */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--danger)' }}>Missing ({missing.length})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {missing.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None identified</span>
                        ) : missing.map(k => (
                            <span key={k} className="tag tag-missing">{k}</span>
                        ))}
                    </div>
                </div>

                {/* Bridged */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--warning)' }}>Added by AI ({bridged.length})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {bridged.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None needed</span>
                        ) : bridged.map(k => (
                            <span key={k} className="tag tag-bridged">~ {k}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Semantic gaps */}
            {semantic.length > 0 && (
                <div>
                    <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>
                        Terminology Upgrades (JD prefers these exact terms)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {semantic.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-secondary)', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                                <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{s.resume_equivalent}</span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{s.jd_term}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* JD role context */}
            {jdAnalysis.role_context && (
                <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {Object.entries(jdAnalysis.role_context).map(([k, v]) => (
                            <div key={k} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 14px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'capitalize' }}>{k.replace('_', ' ')}: </span>
                                <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
