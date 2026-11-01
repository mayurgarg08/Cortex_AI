import React from 'react'

// Slow-moving blurred colour blobs used behind the login and splash screens
function AuroraBackground({ className = "" }) {
  return (
    <div className={`aurora pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className='absolute -top-[20%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full bg-indigo-600/25 blur-[120px] animate-aurora' />
      <div className='absolute top-[10%] -right-[15%] h-[50vmax] w-[50vmax] rounded-full bg-violet-600/20 blur-[120px] animate-aurora [animation-delay:-6s]' />
      <div className='absolute -bottom-[25%] left-[20%] h-[45vmax] w-[45vmax] rounded-full bg-cyan-500/15 blur-[120px] animate-aurora [animation-delay:-12s]' />
      <div className='absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]' />
    </div>
  )
}

export default AuroraBackground
