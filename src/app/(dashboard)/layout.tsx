'use client'
import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react'
import '../globals.css'
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from 'next-auth/react';
import { Pdfs } from '@/components/Pdfs';
import { useModel } from '@/store/store';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });
  
  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const model=useModel((state)=> state.model)
    return (
        <html lang="en"> 
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
              <div className="w-full h-full flex">
                <SidebarProvider>
                <AppSidebar/>
                <div className="w-full min-h-screen flex flex-col bg-[#1A1A1A] text-[#F4F1ED] relative">
                  <Header className='sticky top-0 z-10' />
                  {model.LM=="RAG" && 
                  <Pdfs className={'sticky top-[65px] ml-4 z-10 cursor-pointer'} />}
                  {children}
                </div>
                </SidebarProvider>
              </div>
          </body>
        </html>
    );
  }