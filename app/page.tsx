'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ScoreDashboard from '@/components/ScoreDashboard'
import KeywordTable from '@/components/KeywordTable'
import DiffView from '@/components/DiffView'
import ProgressStepper from '@/components/ProgressStepper'
import type { JDAnalysis, GapAnalysis, RewrittenResume } from '@/lib/types'

type Step = 'input' | 'analyzing' | 'rewriting' | 'results'

interface AnalyzeResult {
  jd_analysis: JDAnalysis
  gap_analysis: GapAnalysis
  original_text: string
  job_description: string
}

interface RewriteResult {
  rewritten_resume: RewrittenResume
  after_score: {
    hard_skill: number
    tools: number
    soft_skill: number
    overall: number
  }
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [pastedResume, setPastedResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [currentPass, setCurrentPass] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null)
  const [activeScoreCategory, setActiveScoreCategory] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description.')
      return
    }
    if (!file && !pastedResume.trim()) {
      setError('Please upload a resume file or paste your resume text.')
      return
    }

    setError(null)
    setStep('analyzing')
    setCurrentPass(1)

    try {
      const formData = new FormData()
      if (file) formData.append('resume', file)
      if (pastedResume) formData.append('resumeText', pastedResume)
      formData.append('jobDescription', jobDescription)

      setCurrentPass(2)
      const analyzeRes = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!analyzeRes.ok) {
        const { error: msg } = await analyzeRes.json()
        throw new Error(msg || 'Analysis failed.')
      }
      const data: AnalyzeResult = await analyzeRes.json()
      setAnalyzeResult(data)

      // Pass 3
      setStep('rewriting')
      setCurrentPass(3)
      const rewriteRes = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: data.original_text,
          jdAnalysis: data.jd_analysis,
          gapAnalysis: data.gap_analysis,
        }),
      })
      if (!rewriteRes.ok) {
        const { error: msg } = await rewriteRes.json()
        throw new Error(msg || 'Rewrite failed.')
      }
      const rewriteData: RewriteResult = await rewriteRes.json()
      setRewriteResult(rewriteData)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStep('input')
      setCurrentPass(0)
    }
  }

  const handleDownload = async () => {
    if (!rewriteResult) return
    setDownloading(true)
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewritten_resume: rewriteResult.rewritten_resume }),
      })
      if (!res.ok) throw new Error('Download failed.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (rewriteResult.rewritten_resume.name?.replace(/\s+/g, '_') || 'resume') + '_ot.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setDownloading(false)
    }
  }

  const handleReset = () => {
    setStep('input')
    setCurrentPass(0)
    setAnalyzeResult(null)
    setRewriteResult(null)
    setError(null)
    setFile(null)
    setPastedResume('')
    setJobDescription('')
    setActiveScoreCategory(null)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Hero Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>R</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Resume<span className="gradient-text">AI</span>
          </span>
        </div>
        {step === 'results' && (
          <button onClick={handleReset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            ← Start over
          </button>
        )}
      </nav>

      {/* ── Input Screen ──────────────────────────────────────────────────── */}
      {step === 'input' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
              <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>Powered by Tza</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              Your resume,{' '}
              <span className="gradient-text">intelligently optimized</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              Paste a job description, upload your resume. Claude runs 3 AI passes to rewrite every bullet with achievement-based language and deliver an ATS-ready DOCX.
            </p>
          </div>

          {/* Upload + JD grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* Resume Upload */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Resume</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>PDF, DOCX, or TXT — max 10MB</p>

              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--accent-light)' : file ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDragActive ? 'rgba(124,58,237,0.06)' : file ? 'rgba(16,185,129,0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: 16,
                }}
              >
                <input {...getInputProps()} />
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {file ? '✅' : isDragActive ? '📂' : '📄'}
                </div>
                {file ? (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
                      {isDragActive ? 'Drop it here' : 'Drag & drop your resume'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>or click to browse</div>
                  </div>
                )}
              </div>

              {/* Or paste */}
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: 12 }}>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-card)', padding: '0 12px', color: 'var(--text-muted)', fontSize: 12 }}>or paste text</span>
              </div>
              <textarea
                className="input-base"
                value={pastedResume}
                onChange={e => { setPastedResume(e.target.value); if (e.target.value) setFile(null) }}
                placeholder="Paste resume text here…"
                rows={5}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Job Description */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Job Description</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Paste the full JD — Claude will extract all requirements</p>
              <textarea
                className="input-base"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={16}
                style={{ resize: 'vertical', height: '100%', minHeight: 320 }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              style={{ fontSize: 16, padding: '16px 48px', minWidth: 240 }}
            >
              ✨ Analyze &amp; Optimize
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
              Runs 3 Claude AI passes · Typically 30–60 seconds
            </p>
          </div>
        </div>
      )}

      {/* ── Loading Screen ────────────────────────────────────────────────── */}
      {(step === 'analyzing' || step === 'rewriting') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 77px)', padding: 24 }}>
          <ProgressStepper currentPass={currentPass} />
        </div>
      )}

      {/* ── Results Screen ────────────────────────────────────────────────── */}
      {step === 'results' && analyzeResult && rewriteResult && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }} className="fade-in-up">
          {/* Score Dashboard */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>ATS Score Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Click a category to see matched vs missing keywords</p>
            <ScoreDashboard
              before={analyzeResult.gap_analysis.match_score}
              after={rewriteResult.after_score}
              gapAnalysis={analyzeResult.gap_analysis}
              activeCategory={activeScoreCategory}
              onCategoryClick={setActiveScoreCategory}
            />
          </div>

          {/* Keyword Table */}
          <div style={{ marginBottom: 40 }}>
            <KeywordTable
              gapAnalysis={analyzeResult.gap_analysis}
              jdAnalysis={analyzeResult.jd_analysis}
            />
          </div>

          {/* Diff View */}
          <div style={{ marginBottom: 40 }}>
            <DiffView
              originalText={analyzeResult.original_text}
              optimizedText={rewriteResult.rewritten_resume.raw_text || ''}
            />
          </div>

          {/* Download */}
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 48 }}>🎉</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your optimized resume is ready</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              ATS-safe DOCX · Calibri 11pt · Achievement-based bullets throughout
            </p>
            <button
              className="btn-primary"
              onClick={handleDownload}
              disabled={downloading}
              style={{ fontSize: 16, padding: '16px 48px', minWidth: 260 }}
            >
              {downloading ? 'Generating DOCX…' : '⬇ Download Optimized Resume'}
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
