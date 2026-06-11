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
        {/* Purple glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '200px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'rgba(109,40,217,0.2)',
          filter: 'blur(80px)',
        }} />

        {/* Logo */}
        <div style={{ fontSize: '52px', fontWeight: 800, color: 'white', marginBottom: '12px', letterSpacing: '-2px' }}>
          Nexus
        </div>

        {/* Purple underline */}
        <div style={{ width: '64px', height: '4px', background: '#7c3aed', borderRadius: '2px', marginBottom: '44px' }} />

        {/* Headline */}
        <div style={{ fontSize: '60px', fontWeight: 700, color: 'white', lineHeight: '1.1', marginBottom: '8px', letterSpacing: '-1px' }}>
          Track Your JEE
        </div>
        <div style={{ fontSize: '60px', fontWeight: 700, color: '#8b5cf6', lineHeight: '1.1', marginBottom: '28px', letterSpacing: '-1px' }}>
          Syllabus.
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '24px', color: '#6b7280', maxWidth: '640px', lineHeight: '1.5' }}>
          Monitor progress across Physics, Chemistry and Maths. Stay ahead with friends.
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '52px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <div style={{ fontSize: '34px', fontWeight: 700, color: 'white' }}>250+</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Chapters</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <div style={{ fontSize: '34px', fontWeight: 700, color: 'white' }}>3</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Subjects</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <div style={{ fontSize: '34px', fontWeight: 700, color: 'white' }}>Live</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Progress</div>
          </div>
        </div>

        {/* URL bottom right */}
        <div style={{ position: 'absolute', bottom: '44px', right: '80px', fontSize: '18px', color: '#374151' }}>
          nexus-jee.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
