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
import React, { useState } from "react";
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
  const [WhichFunction, setWhichFunction] = useState<FunctionType>({ title :'Chat', icon: MessageCircle });
  const [query, setquery] = useState("")
  const pathname = usePathname()
  const { register, handleSubmit,reset } = useForm();

  const onSubmit = (data:any) => {
    const payload: formvalues = {
      query: data.query ?? "",
      type: WhichFunction.title
    };
    console.log(payload);
    search?.(payload)
    dosearch?.(payload)
    reset()
  };

  return (
    <div className={`${className} w-full flex justify-center items-center text-white mb-6`}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex justify-center items-center">
            <div className="w-[98%] sm:w-[50vw] md:w-[75vw] lg:w-190 h-full max-h-32 bg-[#303030]/50 backdrop-blur-lg border-2 border-gray-400 rounded-3xl p-4 flex flex-col justify-between">
            <div className="pb-8">
                <input
                {...register("query",{ required: true })}
                type="text"
                placeholder="Enter your query"
                className="text-white outline-0 w-full text-wrap"
                />
            </div>
            <div className="w-full flex justify-between items-center">
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
                    <DropdownMenuContent className="w-20 dark" align="start">
                    <DropdownMenuGroup>
                        <DropdownMenuItem>Add files</DropdownMenuItem>
                    </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        className=" bg-[#292929] border-0 rounded-3xl"
                        variant="outline"
                    >
                        {WhichFunction.title=="" ?<SlidersHorizontal /> : <h1 className="flex gap-2 items-center"><WhichFunction.icon/>{WhichFunction.title}</h1>}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                    className="w-48 dark p-2 rounded-3xl"
                    align="start"
                    >
                    <DropdownMenuGroup>
                        {functions.map((item) => (
                        <DropdownMenuItem onClick={() => setWhichFunction({ title: item.title, icon: item.icon })}>
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
