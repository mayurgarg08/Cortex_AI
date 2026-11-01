import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { LogoMark } from './Logo'
import AuroraBackground from './AuroraBackground'

// Shown while the session is being checked. The free backend sleeps when idle,
// so after a few seconds explain why it is taking a while.
function SplashScreen() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='relative h-dvh flex flex-col items-center justify-center gap-6 bg-ink-950 overflow-hidden'>
      <AuroraBackground className='opacity-60' />

      <div className='relative flex items-center justify-center'>
        {[0, 0.6, 1.2].map((delay) => (
          <motion.div
            key={delay}
            className='absolute h-16 w-16 rounded-2xl border border-cyan-400/40'
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeOut" }}
          />
        ))}
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <LogoMark size={64} className="drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]" />
        </motion.div>
      </div>

      <div className='relative text-center px-6'>
        <p className='text-[15px] font-semibold text-slate-200'>
          {slow ? "Waking up the server" : "Connecting to CortexAI"}
        </p>
        <p className='mt-1.5 text-[13px] text-slate-500 max-w-[300px] min-h-[40px]'>
          {slow ? "The server sleeps when idle. This can take up to a minute the first time." : ""}
        </p>
      </div>
    </div>
  )
}

export default SplashScreen
