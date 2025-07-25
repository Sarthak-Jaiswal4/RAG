'use client'
import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react'
import '../globals.css'
import { Geist, Geist_Mono } from "next/font/google";

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
    return (
        <html lang="en"> 
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <div className="w-full h-full flex">
              <SidebarProvider>
              <AppSidebar/>
              <div className="w-full min-h-screen flex flex-col bg-[#171717] text-white relative">
                <Header className='sticky top-0 z-10' />
                {children}
              </div>
              </SidebarProvider>
            </div>
          </body>
        </html>
    );
  }