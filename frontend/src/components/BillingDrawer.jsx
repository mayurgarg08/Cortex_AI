import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { Check, Crown, Loader2, Rocket, Sparkles, X, Zap } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../features/createOrder'
import { verifyPayment } from '../features/verifyPayment'
import getCurrentUser from '../features/getCurrentUser'
import { setUserdata } from '../redux/userSlice'

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "₹199",
        credits: "500 credits",
        icon: Rocket,
        features: ["All 7 AI agents", "PDF, PPT & image generation", "Live code preview"],
    },
    {
        id: "pro",
        name: "Pro",
        price: "₹499",
        credits: "1000 credits",
        icon: Crown,
        popular: true,
        features: ["Everything in Starter", "2x the credits", "Best value per credit"],
    },
]

function BillingDrawer({ open, onClose }) {

    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [pendingPlan, setPendingPlan] = useState(null)
    const [status, setStatus] = useState(null)

    const credits = userData?.credits ?? 0
    const totalCredits = userData?.totalCredits || 100
    const creditPercent = Math.min(100, Math.max(0, (credits / totalCredits) * 100))

    const handleUpgrade = async (plan) => {
        setStatus(null)
        setPendingPlan(plan)
        try {
            const data = await createOrder(plan)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data?.order?.amount,
                currency: data?.order?.currency,
                name: "CortexAI",
                description: `${data?.plan?.name} Plan`,
                order_id: data?.order?.id,
                handler: async (response) => {
                    try {
                        await verifyPayment(response)
                        // Refresh plan and credits shown in the sidebar
                        const user = await getCurrentUser()
                        if (user) dispatch(setUserdata(user))
                        setStatus({ type: "success", text: "Payment successful. Your credits have been added." })
                    } catch (error) {
                        console.log(error)
                        setStatus({ type: "error", text: "We couldn't verify the payment. Please contact support." })
                    }
                },
                modal: {
                    ondismiss: () => setPendingPlan(null)
                },
                theme: {
                    color: "#7c3aed"
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.log(error)
            setStatus({ type: "error", text: "Couldn't start the payment. Please try again." })
        } finally {
            setPendingPlan(null)
        }
    }
    return (
        <AnimatePresence>
            {open && <> <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            />
                <motion.aside
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed right-0 top-0 z-[60] h-dvh w-full max-w-[420px] bg-ink-900 border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
                >
                    <div className='pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-600/20 blur-[90px]' />

                    <div className='relative flex items-center justify-between px-6 py-5 border-b border-white/[0.06]'>
                        <div>
                            <h2 className='text-white text-[18px] font-bold tracking-tight'>Plans & credits</h2>
                            <p className='text-slate-500 text-[13px]'>Each request uses credits from your balance</p>
                        </div>
                        <button aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                            <X size={17} className="text-slate-300" />
                        </button>
                    </div>

                    <div className='relative flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-5'>
                        <div className='gradient-border rounded-2xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-cyan-500/10 p-5'>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <p className='text-slate-400 text-[12px] font-medium uppercase tracking-[0.12em]'>Current plan</p>
                                    <h3 className='mt-1 text-white text-[24px] font-bold capitalize'>{userData?.plan || "free"}</h3>
                                </div>
                                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-300/25'>
                                    <Sparkles className='text-amber-300' size={20} />
                                </div>
                            </div>

                            <div className='mt-5'>
                                <div className='flex justify-between text-[12px] mb-2'>
                                    <span className='text-slate-400'>Credits remaining</span>
                                    <span className='font-semibold text-slate-200'>{credits} / {totalCredits}</span>
                                </div>
                                <div className='h-2 rounded-full bg-white/[0.08] overflow-hidden'>
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${creditPercent}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    />
                                </div>
                                {userData?.planExpiresAt && (
                                    <p className='mt-2 text-[11.5px] text-slate-500'>Renews on {new Date(userData.planExpiresAt).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>

                        {status && (
                            <div className={`rounded-xl px-4 py-3 text-[13px] ring-1 ${status.type === "success" ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20" : "bg-rose-500/10 text-rose-300 ring-rose-400/20"}`}>
                                {status.text}
                            </div>
                        )}

                        {PLANS.map((plan) => {
                            const Icon = plan.icon
                            return (
                                <div key={plan.id} className={`relative rounded-2xl p-5 ${plan.popular ? "gradient-border bg-white/[0.04]" : "bg-white/[0.025] ring-1 ring-white/[0.07]"}`}>
                                    {plan.popular && (
                                        <span className='absolute -top-2.5 right-5 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-lg shadow-violet-900/50'>
                                            <Zap size={10} /> Popular
                                        </span>
                                    )}
                                    <div className='flex items-center gap-3'>
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.popular ? "bg-brand text-white" : "bg-white/[0.06] text-slate-300"}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h3 className='text-white text-[15px] font-semibold'>{plan.name}</h3>
                                            <p className='text-slate-500 text-[12px]'>{plan.credits}</p>
                                        </div>
                                        <p className='ml-auto text-[24px] font-bold text-white'>{plan.price}</p>
                                    </div>
                                    <ul className='mt-4 space-y-2'>
                                        {plan.features.map((feature) => (
                                            <li key={feature} className='flex items-center gap-2 text-[13px] text-slate-400'>
                                                <Check size={14} className="text-emerald-400 shrink-0" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        disabled={pendingPlan !== null}
                                        onClick={() => handleUpgrade(plan.id)}
                                        className={`mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-semibold transition cursor-pointer disabled:opacity-60
                                        ${plan.popular ? "bg-brand text-white shadow-lg shadow-violet-900/40 hover:brightness-110" : "bg-white/[0.07] text-slate-100 hover:bg-white/[0.12]"}`}
                                    >
                                        {pendingPlan === plan.id && <Loader2 size={15} className="animate-spin" />}
                                        Upgrade to {plan.name}
                                    </button>
                                </div>
                            )
                        })}

                        <p className='pb-2 text-center text-[11.5px] text-slate-600'>Secure payments powered by Razorpay</p>
                    </div>
                </motion.aside>
            </>
            }

        </AnimatePresence>
    )
}

export default BillingDrawer
