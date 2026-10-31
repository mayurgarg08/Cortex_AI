import { MessageSquare, Sparkles } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

function Nav() {
  const {selectedConversation}=useSelector(state=>state.conversation)
  const {messages}=useSelector(state=>state.message)

  return (
    <header className='relative z-10 h-14 shrink-0 flex items-center gap-3 pl-15 pr-24 lg:px-6 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl'>
      {selectedConversation ? (
        <>
          <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 ring-1 ring-violet-400/20 shrink-0'>
            <MessageSquare size={14} className="text-violet-300"/>
          </div>
          <h1 className='text-[14px] font-semibold text-slate-100 tracking-tight truncate'>
            {selectedConversation?.title || "New Chat"}
          </h1>
          <span className='hidden sm:inline-flex shrink-0 text-[11px] font-medium text-slate-500 bg-white/[0.04] ring-1 ring-white/[0.06] px-2 py-0.5 rounded-full'>
            {messages?.length || 0} {messages?.length == 1 ? "message" : "messages"}
          </span>
        </>
      ) : (
        <div className='flex items-center gap-2 text-[14px] font-semibold text-slate-200'>
          <Sparkles size={15} className="text-violet-300" />
          New chat
        </div>
      )}
    </header>
  )
}

export default Nav
