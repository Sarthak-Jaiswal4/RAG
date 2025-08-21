import React from 'react'

function Toggleswitch({changetoggle,toggle}:{changetoggle:any,toggle:string}) {
  return (
    <div className='relative flex w-28 h-9 items-center rounded-2xl bg-[#303030]/50'>
        <div className={`w-[50%] h-full text-center pt-[6px] hover:cursor-pointer rounded-2xl ${toggle=="LLM" ? 'text-[#E27D60] bg-[#313131] font-medium' : 'text-[#F4F1ED]'}`}
            onClick={()=> changetoggle("LLM")}
        >
            LLM
        </div>
        <div className={`w-[50%] h-full text-center pt-[6px] hover:cursor-pointer rounded-2xl ${toggle=="RAG" ? 'text-[#E27D60] bg-[#313131] font-medium' : 'text-[#F4F1ED]'}`} 
        onClick={()=> changetoggle("RAG")}
        >
            RAG
        </div>
    </div>
  )
}

export default Toggleswitch