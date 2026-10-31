import { createSlice } from "@reduxjs/toolkit";

const messageSlice=createSlice({
    name:"message",
    initialState:{
      messages:[],
      artifacts:[],
      isLoading:false,
      // Text and agent pushed into the chat input from elsewhere (e.g. suggestion cards)
      composerPrefill:null

    },
    reducers:{
       setMessages:(state,action)=>{
        state.messages=action.payload
       },
        addMessage:(state,action)=>{
        state.messages.push(action.payload)
       },
       setArtifacts:(state,action)=>{
        state.artifacts=action.payload
       },
       setIsLoading:(state,action)=>{
        state.isLoading=action.payload
       },
       setComposerPrefill:(state,action)=>{
        state.composerPrefill=action.payload
       }


    }

})

export const {setMessages,addMessage,setArtifacts,setIsLoading,setComposerPrefill}=messageSlice.actions
export default messageSlice.reducer
