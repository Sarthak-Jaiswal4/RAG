'use client'
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

export default function ExcalidrawApp() {
  const [query, setquery] = useState("")
  const [Data, setData] = useState<any[]>([])
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawKey, setExcalidrawKey] = useState(0);
  const [working, setworking] = useState(false)
  const [initialData, setinitialData] = useState<any>(
    {
      "elements": []
    }
  )

  const updatedrawing = async () => {
    try {
      setworking(true)
      const res = await axios.post('/api/changeDiagram', {
        query,
        prevJson: initialData ? JSON.stringify(initialData) : ""
      })
      const newjson = res.data.res2
      const cleanedJson = newjson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const NewJson = JSON.parse(cleanedJson)
      setworking(false)
      console.log("new json", NewJson)
      setData((prev) => [...prev, NewJson])
      setinitialData(NewJson)
      setExcalidrawKey(prev => prev + 1);
    } catch (error) {
      console.log("Error in updating drawing", error)
      throw error
    }
  }

  const Createdrawing = async () => {
    try {
      setworking(true)
      const res = await axios.post('/api/createDiagram', {
        query,
      })
      const newjson = res.data.jsonanswer2
      const cleanedJson = newjson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const NewJson = JSON.parse(cleanedJson)
      setworking(false)
      console.log("new query", NewJson)
      setData((prev) => [...prev, NewJson])
      setinitialData(NewJson)
      setExcalidrawKey(prev => prev + 1);
    } catch (error) {
      console.log("Error in creating drawing", error)
      throw error
    }
  }

  return (
    <>
      <div className="w-full h-[76vh] py-2">
        <Excalidraw
          key={excalidrawKey}
          initialData={initialData as any}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
        />
      </div>
      <div className="flex flex-col items-center gap-6 py-2 bg-[#1A1A1A] text-[#F4F1ED]">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl pt-4">
          <Input
            value={query}
            type="text"
            onChange={(e) => setquery(e.target.value)}
            className="flex-1 h-10 rounded-lg border border-[#E27D60] shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Describe your diagram idea..."
          />
          <Button
            onClick={updatedrawing}
            className="bg-[#292929] text-[#E27D60] font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Update Diagram
          </Button>
          <Button
            onClick={Createdrawing}
            className="bg-[#E27D60] hover:bg-[#E27D65] text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Create New
          </Button>
        </div>
        {working && (
        <div className="flex items-center gap-2 mt-4">
          <svg className="animate-spin h-6 w-6 text-[#E27D60]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-[#E27D60] font-medium">Generating diagram...</span>
        </div>
        )}

      </div>
    </>
  )
}