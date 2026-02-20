'use client'

interface Step {
    id: number
    label: string
    description: string
}

const STEPS: Step[] = [
    { id: 1, label: 'Pass 1', description: 'Deconstructing job description…' },
    { id: 2, label: 'Pass 2', description: 'Scoring your resume against the JD…' },
    { id: 3, label: 'Pass 3', description: 'Rewriting with achievement-based bullets…' },
]

export default function ProgressStepper({ currentPass }: { currentPass: number }) {
    return (
        <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
            {/* Spinner */}
            <div style={{ marginBottom: 48 }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--accent)',
                    margin: '0 auto 24px',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    stay jiggy…
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {STEPS.find(s => s.id === currentPass)?.label}
                </div>
            </div>

            {/* Steps */}
            <div className="glass-card" style={{ padding: '28px 32px' }}>
                {STEPS.map((step, i) => {
                    const isDone = step.id < currentPass
                    const isActive = step.id === currentPass
                    const isPending = step.id > currentPass

                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: i < STEPS.length - 1 ? 24 : 0 }}>
                            {/* Dot + connector */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    background: isDone
                                        ? 'rgba(16,185,129,0.2)'
                                        : isActive
                                            ? 'rgba(124,58,237,0.25)'
                                            : 'var(--bg-secondary)',
                                    border: isDone
                                        ? '1.5px solid var(--success)'
                                        : isActive
                                            ? '1.5px solid var(--accent)'
                                            : '1.5px solid var(--border)',
                                    color: isDone ? 'var(--success)' : isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                                    boxShadow: isActive ? '0 0 16px rgba(124,58,237,0.35)' : 'none',
                                    transition: 'all 0.3s ease',
                                }}>
                                    {isDone ? '✓' : step.id}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ width: 2, height: 20, background: isDone ? 'var(--success)' : 'var(--border)', margin: '4px 0', transition: 'background 0.3s' }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ paddingTop: 4, textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? 'var(--text-primary)' : isPending ? 'var(--text-muted)' : 'var(--success)' }}>
                                    {step.label}{isActive && ' — Running'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
