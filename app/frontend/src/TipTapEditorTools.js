import TipTapButton from "./TipTapButton"
import { twMerge } from "tailwind-merge"

/*
    This component renders a toolbar for an TipTap editor instance.
    Supports most common formatting options(h1-3, bold, italics, etc.).

    editor (TipTapEditor, required): An instance of a TipTap editor

    className (str, optional): optional styling
*/
export default function TipTapEditorTools({editor, className})
{
    return (
        <div className={`${twMerge("flex flex-wrap items-center pl-2 color-transition dark:bg-dark2 bg-light4", className)}`}>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                active={['heading', {level: 1}]}
                img="/h1-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                active={['heading', {level: 2}]}
                img="/h2-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                active={['heading', {level: 3}]}
                img="/h3-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={['bold']}
                img="/bold-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={['italic']}
                img="/italic-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={['strike']}
                img="/strike-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={['underline']}
                img="/underline-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                active={['subscript']}
                img="/sub-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                active={['superscript']}
                img="/super-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={['blockquote']}
                img="/blockquote-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={['bulletList']}
                img="/bullet-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={['orderedList']}
                img="/numbered-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={['codeBlock']}
                img="/codeblock-light.png">
            </TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                active={[{textAlign: "left"}]}
                img="/left-light.png"
            ></TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                active={[{textAlign: "center"}]}
                img="/center-light.png"
            ></TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                active={[{textAlign: "right"}]}
                img="/right-light.png"
            ></TipTapButton>
            <TipTapButton
                editor={editor}
                onClick={() => editor.chain().focus().setHardBreak().run()}
                img="/return-light.png"
            ></TipTapButton>
      </div>
    )
}