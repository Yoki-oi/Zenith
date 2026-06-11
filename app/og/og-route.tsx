import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0d14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '200px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '16px', letterSpacing: '-2px' }}>
          Nexus
        </div>
        <div style={{ width: '60px', height: '3px', background: 'linear-gradient(to right, #7c3aed, #4f46e5)', borderRadius: '2px', marginBottom: '40px' }} />

        {/* Headline */}
        <div style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-1px' }}>
          Track Your JEE
          <br />
          <span style={{ color: '#8b5cf6' }}>Syllabus.</span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '22px', color: '#6b7280', maxWidth: '600px', lineHeight: 1.5 }}>
          Monitor progress across Physics, Chemistry & Maths. Stay ahead with friends.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
          {[
            { label: 'Chapters', value: '250+' },
            { label: 'Subjects', value: '3' },
            { label: 'Friends', value: '∞' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '16px 28px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{value}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', bottom: '40px', right: '80px', fontSize: '16px', color: '#374151' }}>
          nexus-jee.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
