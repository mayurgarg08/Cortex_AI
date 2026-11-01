import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { LogoMark } from './Logo'

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"]

function LoadingAnimation() {
    const [labelIndex, setLabelIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length)
        }, 1800)
        return () => clearInterval(interval)
    }, [])

    const label = THINKING_LABELS[labelIndex]

    return (
        <div className='flex items-center gap-3'>
            <div className='relative w-[30px] h-[30px] shrink-0'>
                <motion.div
                    className='absolute -inset-1 rounded-xl bg-[conic-gradient(from_0deg,#6366f1,#a855f7,#22d3ee,#6366f1)] opacity-70 blur-[2px]'
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
                <LogoMark size={30} className="relative" />
            </div>

            <div className='flex items-center gap-2.5 rounded-full bg-fg/[0.03] px-3.5 py-1.5 ring-1 ring-fg/[0.06]'>
                <div className='flex gap-1'>
                    {[0, 0.15, 0.3].map((delay) => (
                        <motion.span
                            key={delay}
                            className='h-1.5 w-1.5 rounded-full bg-gradient-to-br from-indigo-300 to-cyan-300'
                            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
                        />
                    ))}
                </div>
                <div className='overflow-hidden h-5'>
                    <AnimatePresence mode='wait'>
                        <motion.span
                            key={label}
                            className="block text-[13px] font-medium text-gradient"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                            {label}...
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default LoadingAnimation
