import React from 'react';
import { motion } from 'framer-motion';
import { X, Bold, Italic, Underline, Strikethrough, Quote, ListOrdered, List, ListTodo, Outdent, Indent } from 'lucide-react';

interface NotepadOverlayProps {
    setIsNotepadOpen: (open: boolean) => void;
    notepadRef: React.RefObject<HTMLDivElement | null>;
    scale: number;
    isNotepadPositioned: boolean;
    notepadYPos: string;
    notepadMaxHeight: string;
    editorRef: React.RefObject<HTMLDivElement | null>;
    notes: string;
    activeStyles: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikeThrough: boolean;
        insertOrderedList: boolean;
        insertUnorderedList: boolean;
    };
    handleFormat: (command: string, value?: string) => void;
    handleInsertChecklist: () => void;
    handleEditorInput: () => void;
    handleEditorClick: (e: React.MouseEvent) => void;
}

export const NotepadOverlay = ({
    setIsNotepadOpen,
    notepadRef,
    scale,
    isNotepadPositioned,
    notepadYPos,
    notepadMaxHeight,
    editorRef,
    notes,
    activeStyles,
    handleFormat,
    handleInsertChecklist,
    handleEditorInput,
    handleEditorClick
}: NotepadOverlayProps) => {
    return (
        <motion.div
            ref={notepadRef}
            initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            animate={{ opacity: isNotepadPositioned ? 1 : 0, x: 0, scale: scale }}
            exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="notepad-popup"
            style={{
                position: 'fixed',
                right: `${92 * scale}px`,
                top: notepadYPos,
                left: 'auto',
                bottom: 'auto',
                transform: 'none',
                transformOrigin: 'right center',
                zIndex: 1001,
                maxHeight: notepadMaxHeight,
                visibility: isNotepadPositioned ? 'visible' : 'hidden',
                overflowY: 'auto'
            }}
        >
            <div className="notepad-popup-header">
                <span className="notepad-popup-title">Scratchpad</span>
                <button className="notepad-popup-close" onClick={() => setIsNotepadOpen(false)}>
                    <X size={14} />
                </button>
            </div>

            {/* Rich-Text Formatting Toolbar */}
            <div className="notepad-toolbar">
                <button
                    type="button"
                    onClick={() => handleFormat('bold')}
                    className={`toolbar-btn ${activeStyles.bold ? 'active' : ''}`}
                    title="Bold"
                >
                    <Bold size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('italic')}
                    className={`toolbar-btn ${activeStyles.italic ? 'active' : ''}`}
                    title="Italic"
                >
                    <Italic size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('underline')}
                    className={`toolbar-btn ${activeStyles.underline ? 'active' : ''}`}
                    title="Underline"
                >
                    <Underline size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('strikeThrough')}
                    className={`toolbar-btn ${activeStyles.strikeThrough ? 'active' : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={14} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => handleFormat('formatBlock', '<h1>')}
                    className="toolbar-btn text-btn"
                    title="Heading 1"
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('formatBlock', '<h2>')}
                    className="toolbar-btn text-btn"
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('formatBlock', '<blockquote>')}
                    className="toolbar-btn"
                    title="Blockquote"
                >
                    <Quote size={14} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => handleFormat('insertOrderedList')}
                    className={`toolbar-btn ${activeStyles.insertOrderedList ? 'active' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('insertUnorderedList')}
                    className={`toolbar-btn ${activeStyles.insertUnorderedList ? 'active' : ''}`}
                    title="Bulleted List"
                >
                    <List size={14} />
                </button>
                <button
                    type="button"
                    onClick={handleInsertChecklist}
                    className="toolbar-btn"
                    title="Todo List"
                >
                    <ListTodo size={14} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => handleFormat('outdent')}
                    className="toolbar-btn"
                    title="Decrease Indent"
                >
                    <Outdent size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('indent')}
                    className="toolbar-btn"
                    title="Increase Indent"
                >
                    <Indent size={14} />
                </button>
            </div>

            <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                onClick={handleEditorClick}
                className="notepad-popup-textarea custom-scrollbar"
                data-placeholder="Write something..."
                spellCheck={false}
                style={{
                    outline: 'none',
                    userSelect: 'text',
                    WebkitUserSelect: 'text'
                }}
            />

            <div className="notepad-popup-footer">
                <span>{notes ? notes.replace(/<[^>]*>/g, '').length : 0} chars</span>
                <span>Auto-saved</span>
            </div>
        </motion.div>
    );
};
