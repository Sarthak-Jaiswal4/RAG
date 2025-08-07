'use client'
import React, { useEffect, useState } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowRight, Brain, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signIn, SignInResponse } from 'next-auth/react';

interface storage{
    userId:string,
    email:string
}

function page() {
    const [isloading, setisloading] = useState(false)
    const [code, setcode] = useState("")
    const [Storage, setStorage] = useState<storage>({userId:"",email:''})
    const router=useRouter()

    useEffect(() => {
        const retrievesessionstorage=sessionStorage.getItem("verifycode")
        if(retrievesessionstorage){
            setStorage(JSON.parse(retrievesessionstorage))
            sessionStorage.removeItem('verifycode')
        }
    }, [])
    console.log(Storage)

    const handleVerify = async () => {
        if (code.length !== 6) return;
        console.log('Verification code:', code);
        try {
          setisloading(true)
          const signUpAttempt = await axios.post('/api/verifyCode',{
            code,id:Storage.userId
          })
          if(signUpAttempt.data.status==200){
            router.push("/login")
          }
        } catch (error:any) {
          console.log("Error in verifying code in Signup",error)
          setisloading(false)
          throw new Error(error)
        }
      };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>
  
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-blue-400 ml-2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verify Your Account
            </h1>
            <p className="text-gray-400">
              We've sent a verification code to your email
            </p>
            <p className="text-blue-400 font-medium mt-1">
              {Storage.email}
            </p>
          </div>
  
          {/* Verification Card */}
          <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-700/50">
            <div className="space-y-6">
              {/* Code Input */}
              <div className="space-y-4 flex justify-center flex-col items-center">
                <label className="block text-sm font-medium text-gray-200 text-center">
                  Enter 6-digit verification code
                </label>
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setcode(value)}
                >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
                </InputOTP>
              </div>
  
              {/* Verify Button */}
              <button
                onClick={handleVerify}
                className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700
                `}
              >
                {isloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify Code</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
  
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/40 text-gray-400">or</span>
                </div>
              </div>
  
              {/* Resend Code */}
              {/* <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className={`text-sm font-medium transition-colors ${
                    countdown > 0 || isResending
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </span>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div> */}
  
              {/* Help Text */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm text-center">
                  💡 Check your email inbox and spam folder for the verification code
                </p>
              </div>
            </div>
          </div>
  
          {/* Back to Sign In */}
          <div className="mt-8 text-center">
            <button
            onClick={()=> router.push('/signup')}
              type="button"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
  
          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>
              Having trouble? Contact our{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">support team</a>
            </p>
          </div>
        </div>
      </div>
      )
}

export default page