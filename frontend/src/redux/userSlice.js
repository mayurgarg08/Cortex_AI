import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
    name:"user",
    initialState:{
      userData:null,
      // false until the first session check finishes, so the login screen doesn't flash
      authChecked:false,
    },
    reducers:{
        setUserdata:(state,action)=>{
            state.userData=action.payload
            state.authChecked=true
        }
    }

})

export const {setUserdata}=userSlice.actions
export default userSlice.reducer
