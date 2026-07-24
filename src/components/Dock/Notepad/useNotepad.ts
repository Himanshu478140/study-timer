import { useState, useEffect, useRef } from 'react';

export const useNotepad = () => {
    const [isNotepadOpen, setIsNotepadOpen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        insertOrderedList: false,
        insertUnorderedList: false,
    });

    const [notes, setNotes] = useState(() => {
        const savedDate = localStorage.getItem('study-notes-date');
        const todayStr = new Date().toDateString();

        if (savedDate && savedDate !== todayStr) {
            localStorage.setItem('study-notes', '');
            localStorage.setItem('study-notes-date', todayStr);
            return '';
        }

        if (!savedDate) {
            localStorage.setItem('study-notes-date', todayStr);
        }

        return localStorage.getItem('study-notes') || '';
    });

    const updateActiveStyles = () => {
        try {
            setActiveStyles({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
                insertOrderedList: document.queryCommandState('insertOrderedList'),
                insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            });
        } catch (e) {
            // Document.queryCommandState may fail if no selection is active
        }
    };

    useEffect(() => {
        if (isNotepadOpen) {
            const handleSelectionChange = () => {
                updateActiveStyles();
            };
            document.addEventListener('selectionchange', handleSelectionChange);
            return () => {
                document.removeEventListener('selectionchange', handleSelectionChange);
            };
        }
    }, [isNotepadOpen]);

    const handleFormat = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setNotes(editorRef.current.innerHTML);
        }
        updateActiveStyles();
    };

    const handleInsertChecklist = () => {
        document.execCommand('insertHTML', false, '<ul class="todo-checklist"><li style="list-style:none; display:flex; align-items:center; gap:8px;"><input type="checkbox" class="notepad-todo-checkbox" style="width:14px; height:14px; margin:0;" />&nbsp;</li></ul>');
        if (editorRef.current) {
            setNotes(editorRef.current.innerHTML);
        }
    };

    const handleEditorInput = () => {
        if (editorRef.current) {
            setNotes(editorRef.current.innerHTML);
        }
    };

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            const checkbox = target as HTMLInputElement;
            if (checkbox.hasAttribute('checked')) {
                checkbox.removeAttribute('checked');
            } else {
                checkbox.setAttribute('checked', 'true');
            }
            handleEditorInput();
        }
    };

    // Save & log debounce effect
    useEffect(() => {
        localStorage.setItem('study-notes', notes);

        const cleanContent = notes.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (!cleanContent) return;

        const debounceHandler = setTimeout(() => {
            try {
                const savedLogs = localStorage.getItem('scratchpad-logs');
                const logs: Array<{ id: string; timestamp: string; content: string }> = savedLogs ? JSON.parse(savedLogs) : [];
                const now = new Date();
                const lastLog = logs[logs.length - 1];

                if (lastLog && lastLog.content === notes) {
                    return;
                }

                const FIVE_MINUTES_MS = 5 * 60 * 1000;
                const isRecent = lastLog && (now.getTime() - new Date(lastLog.timestamp).getTime() < FIVE_MINUTES_MS);
                const isSameDay = lastLog && (new Date(lastLog.timestamp).toDateString() === now.toDateString());

                if (isRecent && isSameDay) {
                    lastLog.content = notes;
                    lastLog.timestamp = now.toISOString();
                } else {
                    logs.push({
                        id: Math.random().toString(36).substring(2, 9),
                        timestamp: now.toISOString(),
                        content: notes
                    });
                }

                localStorage.setItem('scratchpad-logs', JSON.stringify(logs));
                window.dispatchEvent(new Event('scratchpad-logs-updated'));
            } catch (err) {
                console.error('Error saving scratchpad logs:', err);
            }
        }, 5000);

        return () => clearTimeout(debounceHandler);
    }, [notes]);

    // Sync contentEditable content on open or when notes change
    useEffect(() => {
        if (isNotepadOpen && editorRef.current) {
            if (editorRef.current.innerHTML !== notes) {
                editorRef.current.innerHTML = notes || '<div><br></div>';
            }
        }
    }, [isNotepadOpen, notes]);

    // Check for day change to clear scratchpad and reset daily sessions count
    useEffect(() => {
        const checkDayChange = () => {
            const todayStr = new Date().toDateString();
            const savedDate = localStorage.getItem('study-notes-date');

            if (savedDate && savedDate !== todayStr) {
                setNotes('');
                localStorage.setItem('study-notes', '');
                localStorage.setItem('study-notes-date', todayStr);
            }
        };

        checkDayChange();

        const interval = setInterval(checkDayChange, 60000);
        window.addEventListener('focus', checkDayChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkDayChange);
        };
    }, []);

    return {
        notes,
        setNotes,
        isNotepadOpen,
        setIsNotepadOpen,
        editorRef,
        activeStyles,
        handleFormat,
        handleInsertChecklist,
        handleEditorInput,
        handleEditorClick
    };
};
