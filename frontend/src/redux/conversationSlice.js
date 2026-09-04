import { createSlice } from "@reduxjs/toolkit";

const conversationSlice=createSlice({
    name:"conversation",
    initialState:{
      conversations:[],
      selectedConversation:null
    },
    reducers:{
       setConversations:(state,action)=>{
        state.conversations=Array.isArray(action.payload) ? action.payload : []
       },
       addConversation:(state,action)=>{
        if (action.payload) state.conversations.unshift(action.payload)
       },
        setSelectedConversation:(state,action)=>{
        state.selectedConversation=action.payload
       },

      setConvTitle:(state,action)=>{
           const {title,conversationId}=action.payload
           state.conversations=(Array.isArray(state.conversations) ? state.conversations : []).map((conv)=>(
            conv._id==conversationId?(
             { ...conv,title}
            ):conv
           )) 

           if(state.selectedConversation?._id==conversationId){
               state.selectedConversation={...state.selectedConversation,title}
           }
      }

    }
   
})

export const {setConversations,addConversation,setSelectedConversation,setConvTitle}=conversationSlice.actions 
export default conversationSlice.reducer

