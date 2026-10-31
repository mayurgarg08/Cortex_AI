import React, { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea() {
  const {selectedConversation}=useSelector(state=>state.conversation)
  const dispatch=useDispatch()
  useEffect(()=>{
  const getMesg=async () => {

    if(selectedConversation){
      if(selectedConversation.title=="New Chat")return;
const data=await getMessages(selectedConversation?._id)
      const messages=Array.isArray(data) ? data : []
      dispatch(setMessages(messages))
      const latestArtifactMessage=[...messages].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }

  }

  getMesg()
  },[selectedConversation?._id])
  return (
    <main className='relative z-10 flex-1 flex flex-col min-w-0'>
      <Nav/>
      <MessageList/>
      <ChatInput/>
    </main>
  )
}

export default ChatArea
