import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface User{
        isverified?:boolean
    }
    interface Session{
        user:{
            isverified?:boolean
        } & DefaultSession['user']
    }
}