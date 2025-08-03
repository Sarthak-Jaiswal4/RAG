'use client'
import Chatsection from '@/components/Chatsection'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const param = useSearchParams();
  const [InitialPayload, setInitialPayload] = useState<{ message?: string; type?: string } | null>(null);
  const queryParam   = InitialPayload?.message ?? "" as string
  const typeParam    = InitialPayload?.type  ?? "" as string
  const load:any={
    query:queryParam, type:typeParam,sessionname:id
  }

  useEffect(() => {
    // read and clear sessionStorage once on mount
    const raw = sessionStorage.getItem("initialPayload");
    if (raw) {
      setInitialPayload(JSON.parse(raw));
      sessionStorage.removeItem("initialPayload");
    }
  }, []);

  return (
    <div className='w-full h-full flex justify-center items-center relative'>
      <Chatsection userquery={load} />
    </div>
  );
}

export default page