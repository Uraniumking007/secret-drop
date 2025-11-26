import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Shield } from 'lucide-react'

interface LegalDocumentRendererProps {
  content: string
}

export const LegalDocumentRenderer: React.FC<LegalDocumentRendererProps> = ({
  content,
}) => {
  const components = {
    h1: ({ node, ...props }: any) => <h1 className="hidden" {...props} />,
    h2: ({ node, ...props }: any) => (
      <h2
        className="text-2xl font-semibold text-primary mt-10 mb-4"
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="text-xl font-medium text-foreground mt-8 mb-3"
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p className="leading-relaxed text-muted-foreground mb-4" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul
        className="list-disc list-outside ml-6 mb-4 text-muted-foreground space-y-2"
        {...props}
      />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="list-decimal list-outside ml-6 mb-4 text-muted-foreground space-y-2"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li className="leading-relaxed" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-primary hover:underline underline-offset-4 transition-colors"
        {...props}
      />
    ),
    blockquote: ({ node, ...props }: any) => (
      <div className="my-6 p-4 bg-primary/10 border-l-4 border-primary rounded-r-md flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-foreground/90 leading-relaxed italic">
          {props.children}
        </div>
      </div>
    ),
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
