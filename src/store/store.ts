import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type PdfItem = {
    id: string
    name: string
    selected: boolean
    file: File
}

type StoreState = {
    pdfs: PdfItem[]
    addPdf: (pdf: File) => void
    removePdf: (pdfName: string) => void
    clearPdfs: () => void
    toggleStatus: (id: string) => void
}

type whichmodel={
    LM:string,
    open:boolean
}

type StoreModel={
    model:whichmodel,
    updateModel:(Model:string)=>void
    openSection:(open:boolean)=>void
}

export const useStore = create<StoreState>()(
    devtools(
        persist(
            (set) => ({
                pdfs: [],
                addPdf: (pdf) =>
                    set((state) => ({
                        pdfs: [
                            { id: crypto.randomUUID(), name: pdf.name, selected: true, file: pdf },
                            ...state.pdfs,
                        ],
                    })),
                removePdf: (pdfName) =>
                    set((state) => ({ pdfs: state.pdfs.filter((p) => p.name !== pdfName) })),
                clearPdfs: () => set({ pdfs: [] }),
                toggleStatus: (id) =>
                    set((state) => ({
                        pdfs: state.pdfs.map((e) =>
                            e.id === id ? { ...e, selected: !e.selected } : e
                        ),
                    })),
            }),
            { name: 'rag-app-store' }
        )
    )
)

export const useModel=create<StoreModel>()(
    devtools(
        persist(
            (set)=>({
                model:{LM:"LLM",open:false},
                updateModel:(mod)=>
                    set((state)=> ({
                        model:{...state.model,LM:mod}
                    })),
                openSection:(what)=>
                    set((state)=>({
                        model:{...state.model,open:!open}
                    }))
            }),
            {name:'model'}
        )
    )
)