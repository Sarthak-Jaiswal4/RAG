'use client'
import Chatsection from '@/components/Chatsection'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { formvalues } from '@/types/formvalues'
import { messagetype } from '@/types/messagetype'
import { Query } from 'mongoose'
import { useRouter, useSearchParams } from 'next/navigation'

function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const param = useSearchParams();
  const queryParam   = param.get("query") ?? "" as string
  const typeParam    = param.get("type")  ?? "" as string
  const load:any={
    query:queryParam, type:typeParam,sessionname:id
  }

  return (
    <div className='w-full h-full flex justify-center items-center relative'>
      <Chatsection userquery={load} />
    </div>
  );
}

export default page