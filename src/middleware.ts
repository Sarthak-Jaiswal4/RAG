import { NextResponse, NextRequest } from 'next/server'
import { auth } from './auth'
export { auth } from "./auth"
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await auth()
    console.log(token)
    const url=request.nextUrl

    if(token?.user && (
        url.pathname.startsWith('/signup') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/verify')
    )){
        return NextResponse.redirect(new URL('/', request.url))
    }

}
 
export const config = {
  matcher: ['/login','/signup','/','/verify','/chat/:path*'], 
}