import { Check, Code2, Copy, Eye, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, easeInOut, motion } from "motion/react"
import Editor from '@monaco-editor/react';

const detectLanguage = (fileName = "") => {
  const name = fileName.toLowerCase()

  if (name.endsWith(".html"))
    return "html";

  if (name.endsWith(".css"))
    return "css";

  if (name.endsWith(".js"))
    return "javascript";

  if (name.endsWith(".jsx"))
    return "javascript";

  if (name.endsWith(".ts"))
    return "typescript";

  if (name.endsWith(".tsx"))
    return "typescript";

  if (name.endsWith(".json"))
    return "json";

  if (name.endsWith(".py"))
    return "python";

  if (name.endsWith(".java"))
    return "java";

  if (name.endsWith(".cpp"))
    return "cpp";

  if (name.endsWith(".c"))
    return "c";

  return "plaintext";

}

const fileDotColor = (fileName = "") => {
  const name = fileName.toLowerCase()
  if (name.endsWith(".html")) return "bg-orange-400"
  if (name.endsWith(".css")) return "bg-sky-400"
  if (name.endsWith(".js") || name.endsWith(".jsx")) return "bg-yellow-300"
  if (name.endsWith(".ts") || name.endsWith(".tsx")) return "bg-blue-400"
  if (name.endsWith(".py")) return "bg-emerald-400"
  return "bg-slate-400"
}

function Artifact() {
  const [collapsed, setCollapsed] = useState(false)
  const { artifacts } = useSelector(state => state.message)
  const [tab, setTab] = useState("code")
  const [activeFile, setActiveFile] = useState(0)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!artifacts || artifacts.length == 0) return null;

  const files = artifacts[0]?.files || []
  // A new artifact may have fewer files than the previous one
  const currentFile = activeFile < files.length ? activeFile : 0
  const file = files[currentFile]
  const htmlFile = files.find(f => f.name == "index.html")
  const cssFile = files.find(f => f.name == "style.css")
  const jsFile = files.find(f => f.name == "script.js")

  const canPreview = Boolean(htmlFile)

  const previewDoc = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
     ${cssFile?.content || ""}
    </style>
</head>
<body>
 ${htmlFile?.content || ""}
<script>
    ${jsFile?.content || ""}
</script>
</body>
</html>`


  const handleCopy = async () => {
    await navigator.clipboard.writeText(file?.content || "")
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const tabButton = (id, Icon, label) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium rounded-md transition-all duration-150 cursor-pointer
      ${tab === id ? "bg-brand text-white shadow-[0_2px_10px_-2px_rgba(139,92,246,0.7)]" : "text-slate-400 hover:text-slate-200"}`}
    >
      <Icon size={12} /> {label}
    </button>
  )

  // Called as a function (not rendered as <Component/>) so the editor is not remounted on every state change
  const renderPanel = (onClose) => (
    <div className='flex flex-col h-full bg-ink-900'>

      <div className='h-14 px-3 border-b border-white/[0.06] flex items-center gap-2.5 shrink-0'>
        <button title={onClose ? "Close" : "Collapse panel"} className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0' onClick={onClose ?? (() => setCollapsed(true))}>
          {onClose ? <X size={16} /> : <PanelRightClose size={17} />}
        </button>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/20 shrink-0'>
            <Code2 className="text-emerald-300" size={13} />
          </div>
          <div className='text-[13px] font-semibold text-slate-100 truncate'>{artifacts[0]?.title}</div>
        </div>

        <button
          title="Copy file"
          onClick={handleCopy}
          className='flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer shrink-0'
        >
          {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
        </button>
        {canPreview &&
          <div className='flex items-center gap-0.5 bg-white/[0.04] ring-1 ring-white/[0.06] p-0.5 rounded-lg shrink-0'>
            {tabButton("code", Code2, "Code")}
            {tabButton("preview", Eye, "Preview")}
          </div>}
      </div>

      {tab === "code" && <div className='flex border-b border-white/[0.06] overflow-x-auto scrollbar-none shrink-0 px-1'>
        {
          files.map((f, index) => (
            <button
              key={f?.name || index}
              onClick={() => setActiveFile(index)}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 font-mono text-[11.5px] whitespace-nowrap transition-colors cursor-pointer ${currentFile === index ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${fileDotColor(f?.name)}`} />
              {f?.name}
              {currentFile === index && <span className='absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-t-full' />}
            </button>
          ))
        }
      </div>}


      <div className='flex-1 overflow-hidden'>
        {(tab == "preview" && canPreview) ? <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className='w-full h-full p-3'
        >
          <div className='flex h-full flex-col overflow-hidden rounded-xl ring-1 ring-white/10'>
            <div className='flex items-center gap-1.5 bg-ink-800 px-3 py-2'>
              <span className='h-2.5 w-2.5 rounded-full bg-rose-400/70' />
              <span className='h-2.5 w-2.5 rounded-full bg-amber-400/70' />
              <span className='h-2.5 w-2.5 rounded-full bg-emerald-400/70' />
              <span className='ml-2 flex-1 truncate rounded-md bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-slate-500'>preview · index.html</span>
            </div>
            <iframe title='preview' srcDoc={previewDoc} sandbox='allow-scripts' className='w-full flex-1 bg-white' />
          </div>
        </motion.div>
          :
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className='w-full h-full'
          >
            <Editor
              beforeMount={(monaco) => monaco.editor.defineTheme("cortex", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: { "editor.background": "#090b11", "editorGutter.background": "#090b11", "editor.lineHighlightBackground": "#ffffff08" },
              })}
              theme="cortex"
              language={detectLanguage(file?.name)}
              value={file?.content}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 16 }, lineNumbers: "on", renderLineHighlight: "none" }}

            />

          </motion.div>
        }

      </div>


    </div>
  )

  return (
    <>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-2.5 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand text-white text-[12px] font-semibold shadow-lg shadow-violet-900/40 cursor-pointer"
      >
        <Code2 size={14} />
        Code
      </button>
      <AnimatePresence>
        {mobileOpen && <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: "easeInOut" }} className="lg:hidden fixed inset-y-0 right-0 z-50 w-[92vw] max-w-[460px] border-l border-white/[0.06] overflow-hidden">
            {renderPanel(() => setMobileOpen(false))}
          </motion.div>

        </>
        }

      </AnimatePresence>


      <motion.div
        initial={{ width: 460 }}
        animate={{ width: collapsed ? 56 : 460 }}
        transition={{
          duration: 0.25,
          ease: easeInOut
        }}
        className='hidden lg:flex relative z-10 h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0'>

        {collapsed ?
          <div className='flex h-full bg-ink-900/80 flex-col items-center py-4 gap-4'>
            <button title="Expand panel" className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0' onClick={() => setCollapsed(false)}>
              <PanelRightOpen size={17} />
            </button>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/20'>
              <Code2 className="text-emerald-300" size={14} />
            </div>
            <div
              className='text-[10.5px] font-semibold text-slate-500 tracking-[0.18em] uppercase whitespace-nowrap overflow-hidden'
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)"
              }}
            >{artifacts[0]?.title}</div>
          </div>
          : renderPanel()}
      </motion.div>
    </>
  )
}

export default Artifact
