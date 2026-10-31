import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { ArrowUpRight } from 'lucide-react'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { LogoMark } from './Logo'
import { AGENTS } from '../constants/agents'
import { setComposerPrefill } from '../redux/messageSlice'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 5) return "Working late"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function EmptyState() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const firstName = userData?.name?.split(" ")[0]
  const suggestions = AGENTS.filter(agent => agent.example)

  return (
    <div className='min-h-full flex flex-col items-center justify-center py-10'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className='relative'
      >
        <div className='absolute inset-0 rounded-2xl bg-violet-500/40 blur-2xl' />
        <LogoMark size={56} className="relative" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='mt-6 text-center text-[28px] sm:text-[34px] font-bold tracking-tight text-white'
      >
        {greeting()}{firstName ? <>, <span className='text-gradient'>{firstName}</span></> : ""}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className='mt-2 text-center text-[15px] text-slate-400'
      >
        What would you like to create today?
      </motion.p>

      <div className='mt-9 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {suggestions.map((agent, i) => {
          const Icon = agent.icon
          return (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => dispatch(setComposerPrefill({ text: agent.example, agent: agent.id }))}
              className='group relative flex flex-col items-start gap-3 rounded-2xl bg-white/[0.025] p-4 text-left ring-1 ring-white/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:ring-white/[0.12] cursor-pointer'
            >
              <div className='flex w-full items-center justify-between'>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${agent.accent}`}>
                  <Icon size={16} />
                </div>
                <ArrowUpRight size={16} className="text-slate-600 transition-all duration-200 group-hover:text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>{agent.label}</p>
                <p className='mt-1 text-[13.5px] leading-snug text-slate-300 group-hover:text-white transition-colors'>{agent.example}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function MessageList() {
    const {selectedConversation}=useSelector(state=>state.conversation)
    const {messages,isLoading}=useSelector(state=>state.message)
    const bottemRef=useRef(null)

   useEffect(()=>{
       if(!messages?.length && !isLoading) return
       requestAnimationFrame(()=>{
        bottemRef?.current?.scrollIntoView({
          behavior:"smooth",
          block:"end"
        })
       })
   },[messages?.length,isLoading])

  const showEmptyState = (messages.length==0 || !selectedConversation) && !isLoading

  return (
    <div className='flex-1 overflow-y-auto scrollbar-thin'>
      <div className='mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 min-h-full'>
        {showEmptyState ? <EmptyState/> :
        <div className='space-y-7 pb-4'>
          {messages?.map((msg,i)=>(
              <MessageBubble key={msg?._id || i} role={msg?.role} content={msg?.content} images={msg.images || []} />
          ))}

          {isLoading && <LoadingAnimation/>}
        </div>
        }
        <div ref={bottemRef}/>
      </div>
    </div>
  )
}

export default MessageList
