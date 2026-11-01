import React, { useId } from 'react'

// Neural-network mark: 8 nodes around a glowing core on a dark tile (32x32 grid)
const NODES = [[16, 7.6], [21.94, 10.06], [24.4, 16], [21.94, 21.94], [16, 24.4], [10.06, 21.94], [7.6, 16], [10.06, 10.06]]
const SPOKES = "M16 16L16 7.6M16 16L21.94 10.06M16 16L24.4 16M16 16L21.94 21.94M16 16L16 24.4M16 16L10.06 21.94M16 16L7.6 16M16 16L10.06 10.06"
const RING = "M16 7.6L21.94 10.06L24.4 16L21.94 21.94L16 24.4L10.06 21.94L7.6 16L10.06 10.06Z"
const WEB = "M16 7.6L24.4 16M16 7.6L21.94 21.94M21.94 10.06L21.94 21.94M21.94 10.06L16 24.4M24.4 16L16 24.4M24.4 16L10.06 21.94M21.94 21.94L10.06 21.94M21.94 21.94L7.6 16M16 24.4L7.6 16M16 24.4L10.06 10.06M10.06 21.94L10.06 10.06M10.06 21.94L16 7.6M7.6 16L16 7.6M7.6 16L21.94 10.06M10.06 10.06L21.94 10.06M10.06 10.06L24.4 16"

export function LogoMark({ size = 32, className = "" }) {
  // Unique ids so several logos on one page don't share gradient definitions
  const id = useId().replace(/:/g, "")
  const tile = `${id}-tile`
  const net = `${id}-net`
  const core = `${id}-core`
  const glow = `${id}-glow`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={tile} x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15283f" />
          <stop offset="1" stopColor="#070e1b" />
        </linearGradient>
        <linearGradient id={net} x1="7" y1="16" x2="25" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset=".55" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
        <radialGradient id={core} cx="16" cy="16" r="7.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" stopOpacity=".9" />
          <stop offset=".35" stopColor="#22d3ee" stopOpacity=".4" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation=".6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="32" height="32" rx="7.5" fill={`url(#${tile})`} />
      <rect x=".5" y=".5" width="31" height="31" rx="7" stroke="#ffffff" strokeOpacity=".08" strokeWidth=".6" />
      <circle cx="16" cy="16" r="11.6" stroke="#67e8f9" strokeOpacity=".22" strokeWidth=".4" />
      <circle cx="16" cy="16" r="7.5" fill={`url(#${core})`} />

      <g stroke={`url(#${net})`} strokeLinecap="round" filter={`url(#${glow})`}>
        <path d={WEB} strokeWidth=".28" strokeOpacity=".6" />
        <path d={RING} strokeWidth=".4" strokeOpacity=".85" />
        <path d={SPOKES} strokeWidth=".5" />
      </g>

      <g fill={`url(#${net})`} filter={`url(#${glow})`}>
        {NODES.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.15" />)}
      </g>
      <circle cx="16" cy="16" r="1.75" fill="#ecfeff" filter={`url(#${glow})`} />
    </svg>
  )
}

function Logo({ size = 30, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className="drop-shadow-[0_0_14px_rgba(56,189,248,0.35)]" />
      <span className='text-[17px] font-bold tracking-tight text-fg'>
        Cortex<span className='text-gradient'>AI</span>
      </span>
    </div>
  )
}

export default Logo
