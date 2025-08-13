"use client";
import {
  Plus,
  SendHorizonal,
  Book,
  GraduationCap,
  Search,
  Code,
  SlidersHorizontal,
  MessageCircle,
  Microscope,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { formvalues } from '@/types/formvalues';
import { useParams, usePathname, useRouter } from "next/navigation";

interface props {
  className?: string;
  search?:React.Dispatch<React.SetStateAction<formvalues>>;
  dosearch?:any
}

const functions = [
  { title: "Web Search", icon: Search },
  { title: "Deep Research", icon: Microscope },
  // { title: "Academic", icon: Book },
  // { title: "Code Generation", icon: Code },
  { title :'Chat', icon: MessageCircle }
];

type FunctionType = { title: string | undefined; icon: any | null };

function Searchbar({ className,search,dosearch }: props) {
  const searchboxref=useRef<HTMLTextAreaElement | null>(null)
  const [WhichFunction, setWhichFunction] = useState<FunctionType>({ title :'Chat', icon: MessageCircle });
  const [query, setquery] = useState("")
  const [containerHeight, setContainerHeight] = useState(120)
  const { register, handleSubmit,reset } = useForm();
  const forumfocus=useRef<HTMLTextAreaElement>(null)

  const handleInput = (e:any) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
    
    // Update container height: base height (120px) + extra height from textarea
    const baseHeight = 120;
    const extraHeight = Math.max(0, scrollHeight - 24); // 24px is roughly 1 row
    setContainerHeight(baseHeight + extraHeight);
  };

  const onSubmit = (data:any) => {
    const payload: formvalues = {
      query: data.query ?? "",
      type: WhichFunction.title
    };
    console.log(payload);
    setContainerHeight(120);
    if (searchboxref.current) {
      searchboxref.current.style.height = 'auto';
    }
    search?.(payload)
    dosearch?.(payload)
    reset()
  };

  const handlefocus=()=>{
    setTimeout(() => {
      searchboxref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  const formfocus=()=>{
    searchboxref.current?.focus()
  }

  return (
    <div className={` w-full flex justify-center items-center text-[#F4F1ED] mb-6 border-0 `}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex justify-center items-center overflow-y-visible"
          onClick={formfocus}
        >
          <div
            className="w-[98%] sm:w-[50vw] md:w-[75vw] lg:w-190 bg-[#303030]/50 backdrop-blur-md border-2 shadow-xl border-gray-500 rounded-3xl p-4 flex flex-col justify-between"
            style={{ 
              height: `${containerHeight}px`, 
              minHeight: '120px',
              maxHeight:'35vh'
            }}
          >
            <textarea
              {...register("query", { required: true })}
              onInput={handleInput}
              onFocus={handlefocus}
              placeholder="Enter your Query"
              className={
                `w-full box-border resize-none overflow-y-auto rounded outline-none text-base ${className}`
              }
              ref={(e)=>{
                register("query").ref(e);
                searchboxref.current = e;
              }}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
                }
              }}
            />
            <div className="w-full flex justify-between items-center pt-4">
              <div className="flex gap-2 items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className=" bg-[#292929] border-0 rounded-3xl"
                      variant="outline"
                    >
                      <Plus />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-20 dark bg-[#252525] border-0 shadow-2xl/30 rounded-3xl" align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="hover:bg-[#353535] cursor-pointer">Add files</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-[#292929] text-[#E27D60] border-0 rounded-3xl"
                      variant="outline"
                    >
                      {WhichFunction.title == "" ? (
                        <SlidersHorizontal />
                      ) : (
                        <h1 className="flex gap-2 items-center">
                          <WhichFunction.icon />
                          <span className="">{WhichFunction.title}</span>
                        </h1>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 dark p-2 rounded-3xl bg-[#252525] border-0 shadow-2xl/30"
                    align="start"
                  >
                    <DropdownMenuGroup>
                      {functions.map((item) => (
                        <DropdownMenuItem
                          key={item.title}
                          onClick={() =>
                            setWhichFunction({ title: item.title, icon: item.icon })
                          }
                          className="cursor-pointer"
                        >
                          <item.icon />
                          <span></span>
                          {item.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
              </div>
              <Button variant="ghost" type="submit" className="rounded-3xl">
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </form>
    </div>
  );
}

export default Searchbar;
