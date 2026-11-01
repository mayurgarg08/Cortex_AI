import React from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';
import SplashScreen from '../components/SplashScreen';
import Login from './Login';

function Home() {
    const {userData,authChecked}=useSelector(state=>state.user)

    if(!authChecked) return <SplashScreen/>
    if(!userData) return <Login/>

    return (
        <div className='relative h-dvh flex bg-ink-950 text-fg overflow-hidden'>
            {/* Soft brand glow behind the chat */}
            <div className='pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]' />
            <SideBar/>
            <ChatArea/>
            <Artifact/>
        </div>
    )
}

export default Home
