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
  Cross,
  X,
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
import HoverLabel from "./HoverLabel";
import { Upload } from "@/lib/Producer";
import Toggleswitch from "./ui/Toggleswitch";
import {useDropzone} from 'react-dropzone';
import { useModel, useStore } from "@/store/store";
import { toast } from "sonner";

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
  const [containerHeight, setContainerHeight] = useState(115)
  const { register, handleSubmit,reset } = useForm();
  const [file, setfile] = useState<File | undefined>(undefined)
  const [fileURL, setfileURL] = useState<string | undefined>(undefined)
  const [pdfs, setpdfs] = useState<File[] | undefined>(undefined)
  const addpdfs= useStore((state)=> state.addPdf)
  const searchModel=useModel((state) => state.model)
  const updatesearchModel=useModel((state)=> state.updateModel)
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop: (incomingFiles) => {
      if (incomingFiles.length > 0) {
        incomingFiles.forEach(async(file) => {
          setpdfs((prev) => (prev ? [...prev, file] : [file]));
          await Upload(file)
          addpdfs(file);
        });
      }
    },
  });
  console.log(pdfs)

  const handleInput = (e:any) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
    
    // Update container height: base height (120px) + extra height from textarea
    const baseHeight = 115;
    const extraHeight = Math.max(0, scrollHeight - 24); // 24px is roughly 1 row
    setContainerHeight(baseHeight + extraHeight);
  };

  const onSubmit = (data:any) => {
    const payload: formvalues = {
      query: data.query ?? "",
      type: WhichFunction.title,
      typeofmodel:searchModel.LM
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

  const InputFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const File=e.target?.files?.[0]
    console.log(File)
    setfile(File)
    if(File){
      const url=URL.createObjectURL(File)
      console.log(url)
      setfileURL(url)
      await Upload(File)
      console.log('File uploaded successfully')
    }else{
      setfileURL(undefined)
    }
  }

  return (
    <div className={`w-full flex flex-col justify-center items-center text-[#F4F1ED] mb-6 border-0 relative`}>
      <div className="w-[98%] sm:w-[50vw] md:w-[75vw] lg:w-190 flex justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex justify-center items-center overflow-y-visible z-10"
          onClick={formfocus}
        >
          <div
            className="w-full bg-[#303030]/50 backdrop-blur-md border-2 shadow-xl border-gray-500 rounded-3xl p-4 flex flex-col justify-between"
            style={{  
              height: `${containerHeight}px`, 
              // minHeight: '120px',
              maxHeight:'35vh'
            }}
          >
            <textarea
              {...register("query", { required: true })}
              onInput={handleInput}
              onFocus={handlefocus}
              autoFocus={true}
              placeholder="Enter your Query" 
              className={
                `w-full box-border resize-none overflow-y-auto rounded outline-none text-base font-normal ${className}`
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
                  <DropdownMenuContent className="w-auto dark bg-[#252525] border-0 shadow-2xl/30 rounded-3xl" align="start">
                    <DropdownMenuGroup>
                      <input type="file" className="hover:bg-[#353535] cursor-pointer rounded-3xl inset-0 p-2" onChange={InputFile} />
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
                    className="w-48 dark p-2 rounded-3xl bg-[#252525] border-0 shadow-2xl/30 cursor-pointer"
                    align="start"
                  >
                    <DropdownMenuGroup>
                      {functions.map((item) => (
                        <DropdownMenuItem
                          key={item.title}
                          onClick={() =>
                            setWhichFunction({ title: item.title, icon: item.icon })
                          }
                          className="hover:bg-[#353535] cursor-pointer rounded-3xl"
                        >
                          <item.icon />
                          <span></span>
                          {item.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Toggleswitch toggle={searchModel.LM} changetoggle={updatesearchModel} />
                
              </div>
              <Button variant="ghost" type="submit" className="rounded-3xl">
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </form>
        {file && fileURL && (
          <div className="flex bg-[#303030]/20 border-[1px] border-gray-600 absolute w-[98%] sm:w-[48vw] md:w-[73vw] lg:w-185 px-4 pt-6 rounded-lg items-center top-[80%] h-36 shadow-2xl">
            <div className="rounded-lg relative flex justify-center">
              <img
                className="w-19 h-22 rounded-lg brightness-50"
                src={fileURL}
              />
              <HoverLabel content="Remove">
                <X className="absolute top-1 right-1 cursor-pointer backdrop-blur-lg rounded-xl hover:bg-gray-800/50 " size={16}
                  onClick={() => {
                    setfile(undefined)
                    setfileURL(undefined)
                  }} />
              </HoverLabel>
            </div>
          </div>
        )}
        {searchModel.LM=="RAG" && (
          <div {...getRootProps({className: 'dropzone'})} className="flex bg-[#303030]/20 border-[1px] border-gray-600 absolute w-[98%] sm:w-[48vw] md:w-[73vw] lg:w-185 px-4 pt-6 rounded-lg items-center top-[80%] h-36 shadow-2xl">
           <input {...getInputProps()} multiple/>
          <div className="rounded-lg relative flex justify-center w-full cursor-pointer">
            <div  className="w-full h-full flex justify-center items-center text-center">
              <h1 className="text-gray-400 font-medium border flex justify-center rounded-md items-center border-dashed px-3 py-3 border-gray-500">Click or Drag Your Files Here</h1>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default Searchbar;
