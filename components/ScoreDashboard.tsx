'use client'

import type { GapAnalysis } from '@/lib/types'

interface ScoreRingProps {
    label: string
    before: number
    after: number
    isActive: boolean
    onClick: () => void
}

const CIRCUMFERENCE = 2 * Math.PI * 40

function ScoreRing({ label, before, after, isActive, onClick }: ScoreRingProps) {
    const beforeOffset = CIRCUMFERENCE - (before / 100) * CIRCUMFERENCE
    const afterOffset = CIRCUMFERENCE - (after / 100) * CIRCUMFERENCE
    const improvement = after - before

    return (
        <button
            onClick={onClick}
            style={{
                background: isActive ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: '24px 20px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none',
                color: 'inherit',
                width: '100%',
            }}
        >
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                    {/* Before (ghost) */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="rgba(148,163,184,0.25)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={beforeOffset}
                    />
                    {/* After */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={after >= 80 ? '#10b981' : after >= 60 ? '#7c3aed' : '#f59e0b'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={afterOffset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                {/* Center score */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{after}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Before: {before}</span>
                <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: improvement > 0 ? '#10b981' : '#ef4444',
                    background: improvement > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    padding: '2px 6px', borderRadius: 100,
                }}>
                    {improvement > 0 ? '+' : ''}{improvement}
                </span>
            </div>
        </button>
    )
}

interface ScoreDashboardProps {
    before: { hard_skill: number; tools: number; soft_skill: number; overall: number }
    after: { hard_skill: number; tools: number; soft_skill: number; overall: number }
    gapAnalysis: GapAnalysis
    activeCategory: string | null
    onCategoryClick: (cat: string | null) => void
}

export default function ScoreDashboard({
    before,
    after,
    gapAnalysis,
    activeCategory,
    onCategoryClick,
}: ScoreDashboardProps) {
    const categories = [
        { key: 'overall', label: '🏆 Overall ATS', before: before.overall, after: after.overall },
        { key: 'hard_skill', label: '🔧 Hard Skills', before: before.hard_skill, after: after.hard_skill },
        { key: 'tools', label: '⚙️ Tools & Platforms', before: before.tools, after: after.tools },
        { key: 'soft_skill', label: '🤝 Soft Skills', before: before.soft_skill, after: after.soft_skill },
    ]

    const handleClick = (key: string) => {
        onCategoryClick(activeCategory === key ? null : key)
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {categories.map(cat => (
                    <ScoreRing
                        key={cat.key}
                        label={cat.label}
                        before={cat.before}
                        after={cat.after}
                        isActive={activeCategory === cat.key}
                        onClick={() => handleClick(cat.key)}
                    />
                ))}
            </div>

            {/* Detail panel */}
            {activeCategory && (
                <div className="glass-card fade-in-up" style={{ padding: 24 }}>
                    {activeCategory === 'hard_skill' && (
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Hard Skills · Keyword Detail</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {gapAnalysis.matched_keywords?.slice(0, 20).map(k => (
                                    <span key={k} className="tag tag-matched">✓ {k}</span>
                                ))}
                                {gapAnalysis.keyword_gaps?.slice(0, 15).map(k => (
                                    <span key={k} className="tag tag-missing">✗ {k}</span>
                                ))}
                                {gapAnalysis.gap_bridges?.slice(0, 8).map(b => (
                                    <span key={b.missing_skill} className="tag tag-bridged">~ {b.missing_skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeCategory === 'tools' && (
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Tools & Platforms · Keyword Detail</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {gapAnalysis.matched_keywords?.filter(k => k.length > 2).slice(0, 20).map(k => (
                                    <span key={k} className="tag tag-matched">✓ {k}</span>
                                ))}
                                {gapAnalysis.keyword_gaps?.slice(0, 10).map(k => (
                                    <span key={k} className="tag tag-missing">✗ {k}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeCategory === 'soft_skill' && (
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Soft Skills · Coverage</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {gapAnalysis.over_indexed?.map(k => (
                                    <span key={k} className="tag tag-matched">✓ {k}</span>
                                ))}
                                {gapAnalysis.missing_context?.map(k => (
                                    <span key={k} className="tag tag-missing">✗ {k}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeCategory === 'overall' && (
                        <div>
                            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Overall Score Breakdown</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                                Overall = Hard Skills (50%) + Tools (30%) + Soft Skills (20%)<br />
                                Before: <strong>{before.overall}</strong> → After: <strong style={{ color: 'var(--success)' }}>{after.overall}</strong> (
                                +{after.overall - before.overall} points improvement)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
