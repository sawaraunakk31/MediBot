import React from 'react'
import {useGoogleLogin} from '@react-oauth/google'


function GoogleLogin(){
  const responseGoogle=async (authResult)=>{
    try {
      if(authResult['code']){
        
      }
      console.log(authResult);
      
    } catch (err) {
      console.log(err);
      
    }
  }
  const googleLogin = useGoogleLogin({
    onSuccess:responseGoogle,
    onError:responseGoogle,
    flow: 'auth-code'
  })
  return (
    <div className='App'>
      <button
      onClick={googleLogin}
      >Login with Google</button>
    </div>
  )
}


export default GoogleLogin
