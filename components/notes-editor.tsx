"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'

interface NotesEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function NotesEditor({ content, onChange }: NotesEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] p-2 text-xs',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex gap-1 p-1 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-6 px-2 text-xs"
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-6 px-2 text-xs italic"
        >
          I
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-6 px-2 text-xs"
        >
          • List
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-6 px-2 text-xs"
        >
          1. List
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
