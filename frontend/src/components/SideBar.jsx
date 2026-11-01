import React, { useEffect, useMemo, useState } from 'react'
import { Coins, LogOut, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Search, Sparkles, User, X } from "lucide-react"
import { getConversations } from '../features/getConversations'
import { useDispatch, useSelector } from 'react-redux'
import { setConversations, setSelectedConversation } from '../redux/conversationSlice'
import { setArtifacts, setMessages } from '../redux/messageSlice'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'
import BillingDrawer from './BillingDrawer'
import Logo, { LogoMark } from './Logo'
import ThemeToggle from "./ThemeToggle"

// Buckets conversations by how recently they were updated
const groupConversations = (conversations) => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const day = 24 * 60 * 60 * 1000
    const groups = [
        { label: "Today", items: [] },
        { label: "Yesterday", items: [] },
        { label: "Previous 7 days", items: [] },
        { label: "Older", items: [] },
    ]
    for (const conv of conversations) {
        const time = new Date(conv?.updatedAt || conv?.createdAt || Date.now()).getTime()
        if (time >= startOfToday.getTime()) groups[0].items.push(conv)
        else if (time >= startOfToday.getTime() - day) groups[1].items.push(conv)
        else if (time >= startOfToday.getTime() - 7 * day) groups[2].items.push(conv)
        else groups[3].items.push(conv)
    }
    return groups.filter(group => group.items.length > 0)
}

function Avatar({ userData, size = "w-9 h-9" }) {
    const [imageError, setImageError] = useState(false)
    if (userData?.avatar && !imageError) {
        return (
            <img
                className={`${size} rounded-xl object-cover ring-2 ring-violet-500/30`}
                src={userData.avatar}
                alt={userData?.name || "avatar"}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)} />
        )
    }
    return (
        <div className={`${size} rounded-xl bg-brand flex items-center justify-center text-[13px] font-bold text-white`}>
            {userData?.name?.[0]?.toUpperCase() || <User size={15} />}
        </div>
    )
}

function SideBar() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showBilling, setShowBilling] = useState(false)
    const [query, setQuery] = useState("")
    const dispatch = useDispatch()
    const { conversations: storedConversations, selectedConversation } = useSelector(state => state.conversation)
    const conversations = Array.isArray(storedConversations) ? storedConversations : []
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations()
            dispatch(setConversations(data))
        }
        getConv()
    }, [userData?._id])

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase()
        const filtered = q ? conversations.filter(conv => (conv?.title || "New Chat").toLowerCase().includes(q)) : conversations
        return groupConversations(filtered)
    }, [conversations, query])

    const startNewChat = () => {
        dispatch(setSelectedConversation(null))
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        setMobileOpen(false)
    }

    const openConversation = (conv) => {
        dispatch(setSelectedConversation(conv))
        setMobileOpen(false)
    }

    const handleLogout = async () => {
        await logOut()
        dispatch(setSelectedConversation(null))
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        dispatch(setUserdata(null))
    }

    const credits = userData?.credits ?? 0
    const totalCredits = userData?.totalCredits || 100
    const creditPercent = Math.min(100, Math.max(0, (credits / totalCredits) * 100))

    const iconButton = 'flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-fg/[0.06] transition-colors duration-150 cursor-pointer'

    if (collapsed) {
        return (
            <>
                <div className='hidden lg:flex relative z-10 flex-col items-center w-[64px] h-dvh bg-ink-900/80 border-r border-fg/[0.06] py-4 gap-2 shrink-0'>
                    <LogoMark size={30} className="mb-2" />
                    <button title="Expand sidebar" className={iconButton} onClick={() => setCollapsed(false)}>
                        <PanelLeftOpen size={17} />
                    </button>
                    <ThemeToggle />
                    <button title="New chat" className='flex items-center justify-center w-9 h-9 rounded-xl bg-brand text-white shadow-lg shadow-violet-900/40 hover:brightness-110 transition cursor-pointer' onClick={startNewChat}>
                        <Plus size={17} />
                    </button>

                    <div className='flex-1 w-full overflow-y-auto scrollbar-none flex flex-col items-center gap-1 pt-3'>
                        {conversations.map((conv) => {
                            const isActive = selectedConversation?._id == conv?._id
                            return (
                                <button
                                    key={conv?._id}
                                    title={conv?.title || "New Chat"}
                                    onClick={() => openConversation(conv)}
                                    className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-xl transition-colors cursor-pointer
                                    ${isActive ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25" : "text-slate-500 hover:bg-fg/[0.05] hover:text-slate-300"}`}>
                                    <MessageSquare size={15} />
                                </button>
                            )
                        })}
                    </div>

                    <button title="Plans & credits" className={`${iconButton} text-amber-400/80`} onClick={() => setShowBilling(true)}>
                        <Coins size={17} />
                    </button>
                    <Avatar userData={userData} />
                </div>
                <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
            </>
        )
    }

    return (
        <>
            <button aria-label="Open menu" className='lg:hidden fixed top-3 left-3 z-30 flex items-center justify-center w-9 h-9 rounded-xl glass text-slate-300 hover:text-fg transition-colors cursor-pointer' onClick={() => setMobileOpen(true)}>
                <Menu size={17} />
            </button>

            {mobileOpen && <div onClick={() => setMobileOpen(false)} className='lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' />}

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-10
                w-[284px] h-dvh shrink-0 flex flex-col
                bg-ink-900/95 lg:bg-ink-900/80 backdrop-blur-xl border-r border-fg/[0.06]
                transition-transform duration-300 ease-out
                ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className='flex items-center justify-between px-4 pt-4 pb-3'>
                    <Logo size={28} />
                    <div className="flex items-center gap-0.5">
                    <ThemeToggle />
                    <button title="Collapse sidebar" className={`${iconButton} hidden lg:flex`} onClick={() => setCollapsed(true)}>
                        <PanelLeftClose size={17} />
                    </button>
                    <button aria-label="Close menu" className={`${iconButton} lg:hidden`} onClick={() => setMobileOpen(false)}>
                        <X size={17} />
                    </button>
                    </div>
                </div>

                <div className='px-3 space-y-2.5'>
                    <button
                        className='group w-full flex items-center justify-center gap-2 text-[13.5px] font-semibold text-white bg-brand rounded-xl py-2.5 shadow-lg shadow-violet-900/40 hover:brightness-110 transition cursor-pointer'
                        onClick={startNewChat}
                    >
                        <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" />
                        New chat
                    </button>

                    <div className='flex items-center gap-2 rounded-xl bg-fg/[0.03] px-3 py-2 ring-1 ring-fg/[0.06] focus-within:ring-violet-400/40 transition'>
                        <Search size={14} className="text-slate-500 shrink-0" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Search chats'
                            className='w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-600 outline-none'
                        />
                        {query && <button onClick={() => setQuery("")} className='text-slate-500 hover:text-slate-200 cursor-pointer'><X size={13} /></button>}
                    </div>
                </div>

                <nav className='flex-1 overflow-y-auto scrollbar-thin px-2 pt-3 pb-2'>
                    {groups.length == 0 && (
                        <div className='mx-2 mt-6 flex flex-col items-center gap-2 text-center'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-fg/[0.04] text-slate-600'>
                                <MessageSquare size={17} />
                            </div>
                            <p className='text-[12.5px] text-slate-500'>{query ? "No chats match your search" : "Your conversations will appear here"}</p>
                        </div>
                    )}

                    {groups.map((group) => (
                        <div key={group.label} className='mb-3'>
                            <div className='px-3 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-600'>
                                {group.label}
                            </div>
                            {group.items.map((conv) => {
                                const isActive = selectedConversation?._id == conv?._id
                                return (
                                    <button
                                        key={conv?._id}
                                        onClick={() => openConversation(conv)}
                                        className={`relative w-full flex items-center gap-2.5 text-left cursor-pointer mb-0.5 px-3 py-2 rounded-xl transition-colors duration-150
                                        ${isActive ? "bg-fg/[0.06] text-fg" : "text-slate-400 hover:bg-fg/[0.035] hover:text-slate-200"}`}>
                                        {isActive && <span className='absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400' />}
                                        <MessageSquare size={14} className={isActive ? "text-violet-300 shrink-0" : "text-slate-600 shrink-0"} />
                                        <span className='text-[13px] font-medium truncate'>
                                            {conv?.title || "New Chat"}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </nav>

                <div className='p-3 space-y-2 border-t border-fg/[0.06]'>
                    <button
                        onClick={() => setShowBilling(true)}
                        className='group w-full rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/[0.07] to-cyan-500/[0.06] p-3 text-left ring-1 ring-fg/[0.07] hover:ring-violet-400/30 transition cursor-pointer'
                    >
                        <div className='flex items-center justify-between'>
                            <span className='flex items-center gap-1.5 text-[12px] font-semibold text-slate-200'>
                                <Sparkles size={13} className="text-amber-300" />
                                <span className='capitalize'>{userData?.plan || "free"}</span> plan
                            </span>
                            <span className='text-[11px] font-semibold text-violet-300 group-hover:text-fg transition-colors'>Upgrade</span>
                        </div>
                        <div className='mt-2.5 h-1.5 rounded-full bg-fg/[0.06] overflow-hidden'>
                            <div className='h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 transition-all duration-500' style={{ width: `${creditPercent}%` }} />
                        </div>
                        <p className='mt-1.5 text-[11px] text-slate-500'>{credits} of {totalCredits} credits left</p>
                    </button>

                    <div className='flex items-center gap-2.5 rounded-xl px-2 py-1.5'>
                        <Avatar userData={userData} />
                        <div className='flex-1 min-w-0'>
                            <p className='text-[13px] font-semibold text-slate-100 truncate'>{userData?.name || "User"}</p>
                            <p className='text-[11px] text-slate-500 truncate'>{userData?.email || "Signed in"}</p>
                        </div>
                        <button title="Log out" className={`${iconButton} hover:text-rose-300 hover:bg-rose-500/10`} onClick={handleLogout}>
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
        </>
    )
}

export default SideBar
