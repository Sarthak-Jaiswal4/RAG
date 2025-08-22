'use client'
import React, { useContext,createContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Copy, Paperclip } from 'lucide-react';
import LinkDialogue from './LinkDialogue';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import SourcesList from './SourcesList';
import { PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TableCellContext = createContext(false);
const useInTableCell = () => useContext(TableCellContext);
const TableCellProvider = TableCellContext.Provider;

function AiResponse({ content, State,sources }: { content: string | undefined; State: boolean, sources?:Array<string> }) {
  if (!content) return null;
  const allURLS = []  
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ node, ...props }: { node?: any;[key: string]: any }) => <h3 className="text-xl font-semibold pt-2" {...props} />,
          p: ({ node, ...props }: { node?: any;[key: string]: any }) => <p className="mb-3" {...props} />,
          li: ({ node, ...props }: { node?: any;[key: string]: any }) => <li className="list-disc ml-6 mb-[6px]" {...props} />,
          a: ({ node, href, children, ...props }: { node?: any; href?: string; children?: React.ReactNode;[key: string]: any }) => {
            const isCitation = href?.startsWith('http');
            if (isCitation) {
              allURLS.push(isCitation);
            }
            const match = href?.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
            const domain = match && match[1] ? match[1].split('.')[0] : null;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={isCitation ? 'font-mono bg-gray-700 px-1 rounded text-[12px] relative inline-block' : undefined}
                {...props}
              >
                <div className="relative inline-block group">
                  <Paperclip
                    className="size-3 bg-gray-900 rounded-full inline-block cursor-pointer"
                  />
                  {domain && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:block z-10">
                      <LinkDialogue Link={href} />
                    </div>
                  )}
                </div>
              </a>
            );
          },
          table: ({ node, ...props }: any) => (
            <div className="overflow-auto my-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }: any) => <thead {...props} />,
          tbody: ({ node, ...props }: any) => <tbody {...props} />,
          tr: ({ node, ...props }: any) => <tr className="border-b border-b-gray-600 last:border-0" {...props} />,
          td: ({ node, ...props }: any) => (
            <TableCellProvider value={true}>
              <td className="px-4 py-2 align-top" {...props} />
            </TableCellProvider>
          ),
          th: ({ node, ...props }: any) => (
            <TableCellProvider value={true}>
              <th className="px-4 py-2 font-semibold text-left" {...props} />
            </TableCellProvider>
          ),
          code: ({ node,inline, className, children, ...props }: { node?: any; className?: string; inline?: boolean; children?: React.ReactNode;[key: string]: any }) => {
            const isInTable = useInTableCell();
            const match = /language-(\w+)/.exec(className || '')
            if (isInTable) {
              return (
                <code
                  className="font-mono text-sm break-words bg-[#282c34] p-1 rounded-lg"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // This is a code block - give it the full treatment
            return (
              <div className="border border-gray-500 rounded-md flex-col bg-[#282c34] shadow-md flex overflow-x-auto relative my-4">
                <div className='w-full flex h-8 pt-3 px-2'>
                  <h1 className='px-2'>{match ? match[1] : "Bash"}</h1>
                  <Button
                    className='text-[12px] hover:bg-gray-700/30 hover:text-white absolute right-2 px-1 top-1 py-1'
                    variant='ghost'
                    onClick={() => navigator.clipboard.writeText(String(children))}
                  >
                    <Copy />
                  </Button>
                </div>
                <SyntaxHighlighter language="javascript" customStyle={{
                    margin: 0,
                    padding: "0.75rem 1rem",      // px-4 -> left/right 1rem
                    background: "transparent"
                  }} 
                  codeTagProps={{ style: { padding: 0, margin: 0, fontFamily: "inherit" } }}
                  style={oneDark}  
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {sources && (sources?.length>1)
      ?
      <Sheet>
        <SheetTrigger asChild>
          <Button className='dark rounded-2xl cursor-pointer mt-4' variant="secondary"><span><Paperclip
            className="size-4 inline-block"
          /></span> Sources</Button>
        </SheetTrigger>
        <SourcesList SourceList={sources} />
      </Sheet>
      :
      null
      }
    </>
  );
}

export default AiResponse;