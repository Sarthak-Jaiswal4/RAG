'use client'
import React from 'react'
import Url from './Url';
import ReactMarkdown from 'react-markdown';
import remarkGfm      from 'remark-gfm';

function AiResponse({ content }: { content: string | undefined}) {
  if (!content) {
    return null;
  }
  if (typeof content === "string") {
    return (
      <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      components={{
        // Optional: map Markdown elements to your own styled components
        h3: ({node, ...props}) => <h3 className="text-xl font-semibold" {...props} />,
        p:  ({node, ...props}) => <p className="mb-4" {...props} />,
        li: ({node, ...props}) => <li className="list-disc ml-6 mb-[3px]" {...props} />,
      }}
    />
    );
  }
}

export default AiResponse