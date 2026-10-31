import React, { useId } from 'react'

export function LogoMark({ size = 32, className = "" }) {
  const gradientId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset=".55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M10 11.5 16 8l6 3.5v9L16 24l-6-3.5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" opacity=".55" />
      <path d="M16 8v8m0 0 6-4.5M16 16l-6-4.5M16 16v8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
    </svg>
  )
}

function Logo({ size = 30, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className="drop-shadow-[0_0_14px_rgba(139,92,246,0.45)]" />
      <span className='text-[17px] font-bold tracking-tight text-white'>
        Cortex<span className='text-gradient'>AI</span>
      </span>
    </div>
  )
}

export default Logo
