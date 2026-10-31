import { Check, Copy, Download, ExternalLink, FileText, ImageIcon, Presentation, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { LogoMark } from './Logo'

// Links to files produced by the PDF / PPT / Vision agents
const isGeneratedFileLink = (href = "") => href.includes("/api/files/") || href.includes(".amazonaws.com/")

const fileCardStyle = (label) => {
  const text = label.toLowerCase()
  if (text.includes("pdf")) return { icon: FileText, tint: "from-rose-500/30 to-rose-500/5 text-rose-300", name: "PDF document" }
  if (text.includes("ppt") || text.includes("presentation")) return { icon: Presentation, tint: "from-amber-500/30 to-amber-500/5 text-amber-300", name: "PowerPoint presentation" }
  if (text.includes("image")) return { icon: ImageIcon, tint: "from-fuchsia-500/30 to-fuchsia-500/5 text-fuchsia-300", name: "Image" }
  return { icon: Download, tint: "from-indigo-500/30 to-indigo-500/5 text-indigo-300", name: "File" }
}

const textOf = (children) => React.Children.toArray(children).map(child => typeof child === "string" ? child : "").join("")

function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium transition-colors cursor-pointer ${className}`}>
      {copied ? <><Check size={13} className="text-emerald-400" />Copied</> : <><Copy size={13} />{label}</>}
    </button>
  )
}

function MessageBubble({ role, content, images }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const messageContent = typeof content === "string" ? content : "Unable to display this message."
  const messageImages = Array.isArray(images) ? images : []

  useEffect(() => {
    if (!lightBox) return
    const onKey = (e) => e.key === "Escape" && setLightBox(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightBox])

  const markdownComponents = {
    h1: ({ children }) => <h1 className='text-[22px] font-bold text-white mt-6 mb-3 first:mt-0'>{children}</h1>,
    h2: ({ children }) => <h2 className='text-[18px] font-semibold text-white mt-5 mb-2.5 first:mt-0'>{children}</h2>,
    h3: ({ children }) => <h3 className='text-[16px] font-semibold text-slate-100 mt-4 mb-2 first:mt-0'>{children}</h3>,
    p: ({ children }) => <p className='mb-3 last:mb-0 whitespace-pre-wrap break-words'>{children}</p>,
    strong: ({ children }) => <strong className='font-semibold text-white'>{children}</strong>,
    ul: ({ children }) => <ul className='list-disc marker:text-violet-400/70 pl-5 space-y-1.5 my-3'>{children}</ul>,
    ol: ({ children }) => <ol className='list-decimal marker:text-violet-400/70 pl-5 space-y-1.5 my-3'>{children}</ol>,
    blockquote: ({ children }) => <blockquote className='my-3 border-l-2 border-violet-400/50 bg-violet-500/[0.05] rounded-r-lg pl-4 pr-3 py-2 text-slate-300'>{children}</blockquote>,
    hr: () => <hr className='my-5 border-white/[0.08]' />,
    table: ({ children }) => (
      <div className='overflow-x-auto scrollbar-thin my-4 rounded-xl ring-1 ring-white/[0.08]'>
        <table className='min-w-full text-[13.5px]'>{children}</table>
      </div>
    ),
    th: ({ children }) => <th className='border-b border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-left font-semibold text-slate-200'>{children}</th>,
    td: ({ children }) => <td className='border-b border-white/[0.05] px-3.5 py-2.5'>{children}</td>,

    a: ({ href, children }) => {
      if (isGeneratedFileLink(href)) {
        const label = textOf(children) || "Download"
        const { icon: Icon, tint, name } = fileCardStyle(label)
        return (
          <a href={href} target="_blank" rel="noreferrer"
            className='group my-1 flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white/[0.04] p-3 no-underline ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.07] hover:ring-violet-400/30'>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint}`}>
              <Icon size={19} />
            </span>
            <span className='flex-1 min-w-0'>
              <span className='block text-[13.5px] font-semibold text-slate-100'>{label}</span>
              <span className='block text-[11.5px] text-slate-500'>{name} · click to download</span>
            </span>
            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-violet-900/40 transition-transform group-hover:scale-105'>
              <Download size={15} />
            </span>
          </a>
        )
      }
      return (
        <a href={href} target="_blank" rel="noreferrer"
          className="text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200 hover:decoration-violet-300 inline-flex items-center gap-1">
          {children}
          <ExternalLink size={12} />
        </a>
      )
    },

    // Code blocks render their own container, so drop the default <pre> wrapper
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const value = String(children).replace(/\n$/, "")
      const isBlock = Boolean(className) || value.includes("\n")

      if (!isBlock) {
        return <code className='px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-200 font-mono text-[0.88em] ring-1 ring-violet-400/15'>{value}</code>
      }

      const language = className ? className.replace("language-", "") : "text"
      return (
        <div className='my-4 overflow-hidden rounded-xl ring-1 ring-white/[0.08] bg-[#0b0e14] shadow-xl shadow-black/30'>
          <div className='flex items-center justify-between bg-white/[0.03] border-b border-white/[0.06] px-4 py-2'>
            <div className='flex items-center gap-2'>
              <span className='flex gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-white/10' />
                <span className='h-2.5 w-2.5 rounded-full bg-white/10' />
                <span className='h-2.5 w-2.5 rounded-full bg-white/10' />
              </span>
              <span className='ml-1.5 font-mono text-[11px] lowercase text-slate-400'>{language}</span>
            </div>
            <CopyButton text={value} className="text-slate-400 hover:text-white" />
          </div>
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            showLineNumbers
            lineNumberStyle={{ color: "#3b4252", minWidth: "2.2em" }}
            customStyle={{ margin: 0, padding: "16px", background: "transparent", fontSize: "13px" }}
            codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      )
    },

    img: ({ src, alt }) => {
      if (!src) return null
      return (
        <img
          src={src}
          alt={alt || "Generated image"}
          onClick={() => setLightBox(src)}
          loading="lazy"
          onError={(e) => e.currentTarget.remove()}
          className="my-2 w-full max-w-md rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/40 cursor-zoom-in hover:opacity-95 transition"
        />
      )
    },
  }

  return (
    <div className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className='shrink-0 pt-0.5'>
          <LogoMark size={30} className="drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]" />
        </div>
      )}

      <div className={isUser ? "max-w-[85%] sm:max-w-[75%]" : "flex-1 min-w-0"}>
        <div className={`break-words leading-relaxed text-[14.5px]
          ${isUser
            ? "rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-white shadow-lg shadow-violet-900/30"
            : "text-slate-300 pt-1"
          }`}>

          {messageImages.length > 0 && (
            <div className='flex gap-2.5 mb-4 overflow-x-auto scrollbar-thin pb-1'>
              {messageImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setLightBox(img)}
                  loading="lazy"
                  onError={(e) => e.currentTarget.remove()}
                  className="w-40 h-28 shrink-0 rounded-xl object-cover ring-1 ring-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              ))}
            </div>
          )}

          {isUser
            ? <p className='whitespace-pre-wrap'>{messageContent}</p>
            : <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{messageContent}</Markdown>}
        </div>

        {!isUser && (
          <div className='mt-2 flex opacity-0 group-hover:opacity-100 transition-opacity'>
            <CopyButton text={messageContent} className="rounded-lg px-2 py-1 text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]" />
          </div>
        )}
      </div>

      {lightBox &&
        <div onClick={() => setLightBox(null)} className='fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-6'>
          <div className='absolute top-5 right-5 flex gap-2'>
            <a href={lightBox} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition'>
              <ExternalLink size={17} />
            </a>
            <button onClick={() => setLightBox(null)}
              className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer'>
              <X size={18} />
            </button>
          </div>
          <img
            src={lightBox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[86vh] rounded-2xl ring-1 ring-white/10 shadow-2xl object-contain"
          />
        </div>}
    </div>
  )
}

export default MessageBubble
