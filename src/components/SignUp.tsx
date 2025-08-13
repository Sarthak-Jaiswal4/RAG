import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Mail, Router, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

function SignUpPopup({window}:{window:any}) {
    const router=useRouter()
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full flex gap-2 max-w-sm bg-[#252525] text-[#F4F1ED] dark shadow-2xl">
        {/* Close button (top-right) */}
        <button
          type="button"
          onClick={() => window(false)}
          aria-label="Close signup"
          className="absolute top-2 right-2 p-1 rounded hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20"
        >
          <X className="w-5 h-5 text-[#F4F1ED]" />
        </button>

        <CardHeader>
          <CardTitle className="text-md">
            Keep your work, not just the answers
          </CardTitle>
        </CardHeader>

        <CardContent className="text-gray-300 text-sm">
          Sign up to save search history, access unlimited context, and get
          personalized results. Free to start.
        </CardContent>

        <CardFooter className="flex gap-2 w-full pt-4">
          <div className="space-y-3">
            <button
              type="button"
                onClick={() => signIn("google", { redirectTo: "/" })}
              className="w-full bg-[#E27D60]/15 border border-gray-600 text-[#F4F1ED] py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-1 hover:bg-[#E27D60]/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
          <Button
            className="border-gray-600 text-[#F4F1ED] py-3 px-4 rounded-xl font-medium space-x-2 h-12 flex items-center justify-center"
            variant="outline"
            onClick={() => router.push("/signup")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <h1>SignUp</h1>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignUpPopup