import { ArrowUp, FileText, Loader2, Mic, Paperclip, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setComposerPrefill, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { AGENTS } from '../constants/agents'

const formatSize = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`

function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("auto")
  const { selectedConversation } = useSelector(state => state.conversation)
  const { isLoading, composerPrefill } = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const [focused, setFocused] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)
  const dispatch = useDispatch()


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = ""

      for (let index = event.resultIndex; index < event.results.length; index++) {

        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  // Suggestion cards push a prompt and agent into the composer
  // Syncing local state from a one-off Redux event, so setState here is intended
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!composerPrefill) return
    setValue(composerPrefill.text || "")
    if (composerPrefill.agent) setSelectedAgent(composerPrefill.agent)
    dispatch(setComposerPrefill(null))
    textareaRef.current?.focus()
  }, [composerPrefill])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Grow the textarea with its content, up to a limit
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const filePreview = useMemo(
    () => selectedFile?.type?.startsWith("image/") ? URL.createObjectURL(selectedFile) : null,
    [selectedFile]
  )
  // Object URLs must be revoked or they leak memory
  useEffect(() => () => filePreview && URL.revokeObjectURL(filePreview), [filePreview])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser")
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }

  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleSendMessage = async () => {
    const prompt = value.trim()
    if (!prompt || isLoading) return
    if (listening) recognitionRef.current?.stop()

    dispatch(setIsLoading(true))
    try {
      let conversation = selectedConversation
      if (!conversation) {
        dispatch(setMessages([]))
        const conv = await createConversation()
        if (!conv?._id) throw new Error("Unable to create a conversation. Please try again.")
        dispatch(setSelectedConversation(conv))
        dispatch(addConversation(conv))
        conversation = conv
      }

      if (conversation.title == "New Chat") {
        await updateConversation({ id: conversation._id, title: prompt })
        dispatch(setConvTitle({ conversationId: conversation._id, title: prompt.slice(0, 40) }))
      }

      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("conversationId", conversation._id)
      formData.append("agent", selectedAgent)
      if (selectedFile) formData.append("file", selectedFile)

      dispatch(addMessage({ role: "user", content: prompt }))
      setValue("")
      const data = await sendMessage(formData)
      if (data?.debugError) {
        console.error("Agent request failed:", data.debugError)
      }
      dispatch(setArtifacts(Array.isArray(data?.artifacts) ? data.artifacts : []))
      dispatch(addMessage({
        role: "assistant",
        content: typeof data?.answer === "string" ? data.answer : "Unable to generate a response. Please try again.",
        images: Array.isArray(data?.images) ? data.images : []
      }))
    } catch (error) {
      dispatch(setArtifacts([]))
      dispatch(addMessage({
        role: "assistant",
        content: error?.message || "Unable to generate a response. Please try again.",
        images: []
      }))
    } finally {
      dispatch(setIsLoading(false))
      clearFile()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const canSend = Boolean(value.trim()) && !isLoading
  const activeAgent = AGENTS.find(agent => agent.id === selectedAgent)

  return (
    <div className='relative z-10 shrink-0 px-3 sm:px-6 pb-4 pt-2'>
      <div className='mx-auto w-full max-w-3xl'>
        <div className={`relative rounded-3xl bg-ink-850/90 backdrop-blur-xl ring-1 transition-all duration-300
          ${focused ? "ring-violet-400/40 shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_20px_60px_-20px_rgba(139,92,246,0.45)]" : "ring-fg/[0.08] shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)]"}`}>

          <div className='flex gap-1.5 overflow-x-auto scrollbar-none px-3 pt-3'>
            {AGENTS.map((agent) => {
              const isActive = selectedAgent === agent.id
              const Icon = agent.icon
              return (
                <button
                  key={agent.id}
                  title={agent.description}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer
                  ${isActive
                      ? "bg-brand text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.7)]"
                      : "text-slate-400 bg-fg/[0.03] ring-1 ring-fg/[0.06] hover:bg-fg/[0.07] hover:text-slate-200"
                    }`}>
                  <Icon size={13} className={isActive ? "text-white" : "text-slate-500"} />
                  {agent.label}
                </button>
              )
            })}
          </div>

          {selectedFile && (
            <div className='px-4 pt-3'>
              <div className='inline-flex items-center gap-2.5 rounded-xl bg-fg/[0.04] ring-1 ring-fg/[0.08] py-1.5 pl-1.5 pr-2.5'>
                {filePreview
                  ? <img src={filePreview} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  : <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300'><FileText size={16} /></div>}
                <div className='min-w-0'>
                  <p className='max-w-[180px] truncate text-[12px] font-medium text-slate-200'>{selectedFile.name}</p>
                  <p className='text-[10.5px] text-slate-500'>{formatSize(selectedFile.size)}</p>
                </div>
                <button aria-label="Remove file" className='ml-1 rounded-md p-1 text-slate-500 hover:text-fg hover:bg-fg/10 cursor-pointer' onClick={clearFile}>
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            placeholder={selectedAgent === "auto" ? "Ask CortexAI anything..." : `Ask the ${activeAgent?.label} agent: ${activeAgent?.description.toLowerCase()}`}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={value}
            rows={1}
            className="block w-full bg-transparent outline-none resize-none px-4 pt-3 pb-1 text-[15px] text-slate-100 placeholder:text-slate-500 leading-relaxed scrollbar-thin min-h-[52px]"
          />

          <div className='flex items-center justify-between px-3 pb-3 pt-1'>
            <div className='flex items-center gap-1'>
              <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setSelectedFile(file)
                }
              }} />

              <button title="Attach a PDF or image" className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-fg/[0.06] transition-colors cursor-pointer' onClick={() => fileRef.current.click()}>
                <Paperclip size={17} />
              </button>
              <button
                title={listening ? "Stop dictation" : "Dictate"}
                onClick={toggleMic}
                className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer ${listening ? "bg-rose-500/15 text-rose-300" : "text-slate-500 hover:text-slate-200 hover:bg-fg/[0.06]"}`}>
                {listening && <span className='absolute inset-0 rounded-xl ring-2 ring-rose-400/50 animate-ping' />}
                <Mic size={17} />
              </button>
              <span className='hidden sm:block ml-2 text-[11px] text-slate-600'>
                <kbd className='font-sans'>Enter</kbd> to send · <kbd className='font-sans'>Shift + Enter</kbd> for a new line
              </span>
            </div>
            <button
              aria-label="Send message"
              disabled={!canSend}
              onClick={handleSendMessage}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
              ${canSend ? "bg-brand text-white shadow-[0_6px_20px_-6px_rgba(139,92,246,0.9)] hover:brightness-110 hover:scale-105 cursor-pointer" : "bg-fg/[0.05] text-slate-600 cursor-not-allowed"}`}>
              {isLoading ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.4} />}
            </button>
          </div>
        </div>
        <p className='mt-2 text-center text-[11px] text-slate-600'>CortexAI can make mistakes. Check important information.</p>
      </div>
    </div>
  )
}

export default ChatInput
