import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { ArrowRight, Download, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { setUserdata } from '../redux/userSlice'
import Logo, { LogoMark } from '../components/Logo'
import AuroraBackground from '../components/AuroraBackground'
import { AGENTS } from '../constants/agents'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] } }),
}

function GoogleButton({ loading, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-900 shadow-[0_10px_40px_-10px_rgba(139,92,246,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-12px_rgba(139,92,246,0.9)] disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer ${className}`}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <FcGoogle size={20} />}
      {loading ? "Signing you in..." : "Continue with Google"}
      {!loading && <ArrowRight size={16} className="text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </button>
  )
}

// Static mock of the chat UI, shown as a product preview on the right side
function ProductPreview() {
  return (
    <div className='relative w-full max-w-[460px] animate-float'>
      <div className='absolute -inset-6 rounded-[32px] bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-400/20 blur-3xl' />

      <div className='relative glass gradient-border rounded-3xl p-5 shadow-2xl shadow-black/50'>
        <div className='flex items-center gap-2 pb-4 border-b border-white/[0.06]'>
          <span className='h-2.5 w-2.5 rounded-full bg-rose-400/70' />
          <span className='h-2.5 w-2.5 rounded-full bg-amber-400/70' />
          <span className='h-2.5 w-2.5 rounded-full bg-emerald-400/70' />
          <span className='ml-3 text-[11px] font-medium text-slate-500'>cortexai · new chat</span>
        </div>

        <div className='space-y-4 pt-5'>
          <div className='flex justify-end'>
            <div className='rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-[13px] text-white shadow-lg shadow-violet-900/40'>
              Make a presentation on electric vehicles
            </div>
          </div>

          <div className='flex gap-3'>
            <LogoMark size={28} className="shrink-0" />
            <div className='flex-1 space-y-3'>
              <div className='inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/20'>
                <Sparkles size={11} /> PPT agent
              </div>
              <p className='text-[13px] leading-relaxed text-slate-300'>
                Your 8-slide deck <span className='font-semibold text-white'>"The Electric Road Ahead"</span> is ready.
              </p>
              <div className='flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.07]'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-500/10 text-amber-300'>
                  <Download size={16} />
                </div>
                <div className='flex-1'>
                  <p className='text-[12.5px] font-semibold text-slate-200'>electric-vehicles.pptx</p>
                  <p className='text-[11px] text-slate-500'>8 slides · ready to download</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-5 flex items-center gap-2 rounded-2xl bg-ink-900/70 px-3 py-2.5 ring-1 ring-white/[0.07]'>
          <div className='flex gap-1.5 overflow-hidden'>
            {AGENTS.slice(0, 4).map((agent, i) => (
              <span key={agent.id} className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-medium ${i === 0 ? "bg-brand text-white" : "bg-white/[0.05] text-slate-400"}`}>
                {agent.label}
              </span>
            ))}
          </div>
          <div className='ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-brand'>
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Login() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const googleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      const { data } = await api.post("/api/auth/login", { token })
      dispatch(setUserdata(data))
    } catch (err) {
      console.log(err)
      // Closing the Google popup is not an error worth showing
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setError("Sign in failed. Please try again in a moment.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-dvh overflow-x-hidden bg-ink-950 text-white'>
      <AuroraBackground />

      <header className='relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8'>
        <Logo />
        <button
          onClick={googleLogin}
          disabled={loading}
          className='rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-200 glass hover:bg-white/[0.08] transition-colors cursor-pointer'
        >
          Sign in
        </button>
      </header>

      <main className='relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-14'>
        <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
            className='inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[12px] font-medium text-slate-300'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
            </span>
            7 specialised AI agents, one workspace
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
            className='mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px] lg:text-[64px]'>
            Think it.<br />
            <span className='text-gradient text-gradient-animated'>Cortex builds it.</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
            className='mt-6 max-w-[520px] text-[16px] leading-relaxed text-slate-400 sm:text-[17px]'>
            Chat, write and preview code, research the live web, and generate PDFs,
            presentations and images, all from a single prompt.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className='mt-9 flex flex-col items-center gap-3 lg:items-start'>
            <GoogleButton loading={loading} onClick={googleLogin} />
            {error
              ? <p className='text-[13px] text-rose-400'>{error}</p>
              : <p className='flex items-center gap-1.5 text-[12.5px] text-slate-500'>
                  <ShieldCheck size={14} className="text-emerald-400/80" />
                  Free to start · 100 credits included · No card required
                </p>}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className='flex justify-center lg:justify-end'
        >
          <ProductPreview />
        </motion.div>
      </main>

      <section className='relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8'>
        <motion.p variants={fadeUp} initial="hidden" animate="show"
          className='mb-6 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
          Meet your agents
        </motion.p>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon
            return (
              <motion.div
                key={agent.id}
                variants={fadeUp} initial="hidden" animate="show" custom={i}
                className='group glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]'
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${agent.accent}`}>
                  <Icon size={18} />
                </div>
                <h3 className='mt-4 text-[15px] font-semibold text-slate-100'>{agent.label} agent</h3>
                <p className='mt-1 text-[13px] leading-relaxed text-slate-500'>{agent.description}</p>
              </motion.div>
            )
          })}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={AGENTS.length}
            className='gradient-border flex flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-cyan-500/10 p-5'
          >
            <div>
              <h3 className='text-[15px] font-semibold text-white'>Ready to try it?</h3>
              <p className='mt-1 text-[13px] text-slate-400'>Sign in and send your first prompt in seconds.</p>
            </div>
            <button onClick={googleLogin} disabled={loading}
              className='mt-4 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer'>
              Get started <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className='relative z-10 border-t border-white/[0.06] py-6 text-center text-[12px] text-slate-600'>
        © {new Date().getFullYear()} CortexAI · Multi-agent AI workspace
      </footer>
    </div>
  )
}

export default Login
