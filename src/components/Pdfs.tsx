import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "./ui/checkbox"
import { Files, FileText, Plus } from "lucide-react"
import { useModel, useStore } from "@/store/store"
import { useRef } from "react"

export function Pdfs({className}:{className:any}) {
  const allpdf = useStore((state) => state.pdfs)
  const togglepdf = useStore((state) => state.toggleStatus)
  const updatepdf=useStore((state)=> state.addPdf)
  const inputref = useRef(null)

  console.log(allpdf)

  const inputclick=()=>{
    inputref.current?.click()
  }

  const fileselector=(e:any)=>{
    const file=e.target?.files[0]
    console.log(file)
    updatepdf(file)
  }
  return (
    <div className={`${className}`}>
      <Popover >
        <PopoverTrigger asChild>
          {/* <Button className="bg-[#292929] hover:bg-[#313131] rounded-2xl cursor-pointer" variant="default">Sources</Button> */}
          <Files className="bg-[#292929] hover:bg-[#313131] rounded-md cursor-pointer p-2 " size={36} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 dark rounded-2xl">
          <div className="grid gap-3 pt-2">
            <div className="space-y-2 flex justify-between items-center">
              <h4 className="leading-none font-medium">All PDFs</h4>
              <p className="text-muted-foreground text-sm relative">
                <button onClick={inputclick} className="hover:bg-[#313131] p-1 border-0 cursor-pointer rounded-full">
                  <Plus  size={25} />
                </button>
                <input type="file" onChange={fileselector} ref={inputref} multiple className="absolute w-0 h-0 pointer-events-none"/>
              </p>
            </div>
             { allpdf.length==0 &&
              <h1 className="flex justify-center items-center text-center text-gray-400 text-sm">No PDF uploaded</h1>}
            <div className="grid gap-2">
              {allpdf.map((pdf)=>(
                <Label className="flex justify-between px-2 items-center gap-4 hover:bg-[#313131] py-2 rounded-lg html" key={pdf.id} htmlFor={pdf.id}>
                  <div className="flex gap-2 items-center">
                    <FileText />
                    <h1>{pdf.name}</h1>
                  </div>
                  <Checkbox id={pdf.id} checked={pdf.selected} onCheckedChange={() => togglepdf(pdf.id)}/>
                </Label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
