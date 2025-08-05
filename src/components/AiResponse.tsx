'use client'
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Paperclip } from 'lucide-react';
import LinkDialogue from './LinkDialogue';
import type { BundledLanguage } from 'shiki'
import { createHighlighter } from "shiki";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { nullable } from 'zod';

function AiResponse({ content, State,sources }: { content: string | undefined; State: boolean, sources?:Array<string> }) {
  if (!content) return null;
  const allURLS = []  
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ node, ...props }: { node?: any;[key: string]: any }) => <h3 className="text-xl font-semibold" {...props} />,
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
          code: ({ node, className, children, ...props }: { node?: any; className?: string; children?: React.ReactNode;[key: string]: any }) => {
            return (
              <div className="border rounded-md bg-[#111111] shadow-md p-4 my-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                  <code className={className} {...props}>
                    {children}
                  </code>
                  {/* <CodeBlock code={String(children)} lang="ts" /> */}
                </pre>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <table className="min-w-full border my-4 rounded-lg overflow-hidden" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-b-gray-700 last:border-0" style={{ borderBottomWidth: '0.5px' }} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left border-b-gray-300 border-b-[1px] font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {sources && (sources?.length>1)
      ?
      <Sheet>
        <SheetTrigger asChild>
          <Button className='dark rounded-2xl cursor-pointer' variant="secondary"><span><Paperclip
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

interface CodeBlockProps {
  code: string;
  lang?: string;
}

 async function CodeBlock({ code, lang = "ts" }: CodeBlockProps) {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: ['javascript'],
  });
  const codes = highlighter.codeToHtml('const a = 1', {
    lang: 'javascript',
    theme: 'nord'
  })

  return (
    <div
      className="shiki"
      dangerouslySetInnerHTML={{ __html: codes }}
    />
  );
}

export default AiResponse;