import { Editor } from "@monaco-editor/react";
import { Refresh } from "@mui/icons-material";
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from "react";
import Hyperlink from "../../../components/Hyperlink";
import { highlightJsData } from "./stanLang";

type Monaco = typeof monaco

type Props = {
    text: string | undefined
    defaultText?: string
    onSetText: (text: string) => void
    language: string
    readOnly?: boolean
    wordWrap?: boolean
    onReload?: () => void
    onEditedTextChanged?: (text: string) => void
    onEditedTextOverrider?: (cb: (text: string) => void) => void
    toolbarItems?: ToolbarItem[]
    label: string
    width: number
    height: number
}

export type ToolbarItem = {
    label: string
    onClick?: () => void
    color?: string
}

const TextEditor: FunctionComponent<Props> = ({text, defaultText, onSetText, readOnly, wordWrap, onReload, onEditedTextChanged, onEditedTextOverrider, toolbarItems, language, label, width, height}) => {
    const [internalText, setInternalText] = useState('')
    useEffect(() => {
        if (text !== undefined) {
            setInternalText(text)
        }
    }, [text])
    const handleChange = useCallback((value: string | undefined) => {
        setInternalText(value || '')
    }, [])
    const handleSave = useCallback(() => {
        onSetText(internalText)
    }, [internalText, onSetText])

    useEffect(() => {
        if ((onEditedTextChanged) && (internalText !== undefined)) {
            onEditedTextChanged(internalText)
        }
    }, [internalText, onEditedTextChanged])

    //////////////////////////////////////////////////
    // Seems that it is important to set the initial value of the editor
    // this way rather than using defaultValue. The defaultValue approach
    // worked okay until I navigated away and then back to the editors
    // and then everything was blank, and I couldn't figure out what
    // was causing this. But I think this method is more flexible anyway
    // is it gives us access to the editor instance.
    const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | undefined>(undefined)
    useEffect(() => {
        if (!editor) return
        if (text === undefined) return
        if (editor.getValue() === text) return
        editor.setValue(text || defaultText || '')
    }, [text, editor, defaultText])
    const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        (async () => {
            if (language === 'stan') {

                monaco.editor.defineTheme('vs-stan', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'stanblock', foreground: '#C9A969', fontStyle: 'bold' }, // seems like underscores in tokens are not allowed! (took me a while to figure this out)
                        { token: 'stanstatement', foreground: '#A8EEF7' },
                        { token: 'standistribution', foreground: '#9999FF' },
                        { token: 'stanfunction', foreground: 'ffffaa' },
                        { token: 'stanrangeconstraint', foreground: '#D48331' },
                        { token: 'stanoperator', foreground: '#A8EEF7'},
                        { token: 'stantype', foreground: '#BD9BF8' },
                        { token: 'identifier', foreground: '#DDDDDD' },
                        { token: 'number', foreground: '#D48331' },
                        { token: 'string', foreground: '55ff55' }
                    ],
                    colors: {
                    }
                })
                

                // use cpp as a base language and then add stan keywords
                const x = monaco.languages.getLanguages().filter(l => l.id ==="cpp")[0]
                if (x) {
                    const {language: cppLang} = await (x as any).loader()
                    const hjd = highlightJsData()
                    const stanLang = {...cppLang}
                    stanLang.tokenizer = {...cppLang.tokenizer}
                    stanLang.tokenizer.root = [...cppLang.tokenizer.root]
                    // stanLang.keywords = [...hjd.BLOCKS, ...hjd.STATEMENTS, ...hjd.DISTRIBUTIONS, ...hjd.FUNCTIONS, ...hjd.RANGE_CONSTRAINTS, ...hjd.TYPES]
                    stanLang.keywords = []
                    stanLang.stan_blocks = hjd.BLOCKS
                    stanLang.stan_statements = hjd.STATEMENTS
                    stanLang.stan_distributions = hjd.DISTRIBUTIONS
                    stanLang.stan_functions = hjd.FUNCTIONS
                    stanLang.stan_range_constraints = hjd.RANGE_CONSTRAINTS
                    stanLang.stan_types = hjd.TYPES
                    stanLang.tokenizer.root = [
                        [/[a-zA-Z_]\w*/, {
                            cases: {
                                '@stan_blocks': 'stanblock',
                                '@stan_statements': 'stanstatement',
                                '@stan_distributions': 'standistribution',
                                '@stan_functions': 'stanfunction',
                                '@stan_range_constraints': 'stanrangeconstraint',
                                '@stan_types': 'stantype',
                                '@default': 'identifier'
                            }
                        }],
                        [/~|:|\+=|=|<|>/, 'stanoperator'],
                        ...stanLang.tokenizer.root
                    ]
                    monaco.languages.register({id: 'stan'})
                    monaco.languages.setMonarchTokensProvider('stan', stanLang)
                }
            }

            setEditor(editor)
        })()
    }, [language])
    /////////////////////////////////////////////////

    const editedTextOverrider = useCallback((text: string) => {
        editor?.setValue(text)
    }, [editor])

    useEffect(() => {
        if (onEditedTextOverrider) {
            onEditedTextOverrider(editedTextOverrider)
        }
    }, [editedTextOverrider, onEditedTextOverrider])

    // Can't do this in the usual way with monaco editor:
    // See: https://github.com/microsoft/monaco-editor/issues/2947
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            if (!readOnly) {
                handleSave()
            }
        }
    }, [handleSave, readOnly])

    const toolbarHeight = 25
    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden'}} onKeyDown={handleKeyDown}>
            <NotSelectable>
                <div style={{position: 'absolute', paddingLeft: 20, paddingTop: 5, width, height: toolbarHeight, backgroundColor: 'lightgray'}}>
                    {label}
                    &nbsp;&nbsp;&nbsp;
                    {!readOnly && <Hyperlink disabled={text === internalText} onClick={handleSave} color="black">save</Hyperlink>}
                    &nbsp;&nbsp;&nbsp;
                    {readOnly && <span style={{color: 'gray'}}>read only</span>}
                    &nbsp;&nbsp;&nbsp;
                    {onReload && <LowerABit numPixels={2}><Hyperlink onClick={onReload} color="black"><Refresh style={{fontSize: 14}} /></Hyperlink></LowerABit>}
                    &nbsp;&nbsp;&nbsp;
                    {toolbarItems && toolbarItems.map((item, i) => (
                        <ToolbarItemComponent key={i} item={item} />
                    ))}
                </div>
            </NotSelectable>
            <div style={{position: 'absolute', top: toolbarHeight, width, height: height - toolbarHeight}}>
                <Editor
                    width={width}
                    height={height - toolbarHeight}
                    defaultLanguage={language}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    options={{
                        readOnly,
                        domReadOnly: readOnly,
                        wordWrap: wordWrap ? 'on' : 'off',
                        theme: 'vs-stan' // unfortunately we cannot do this on a per-editor basis - it's a global setting
                    }}
                />
            </div>
        </div>
    )
}

const ToolbarItemComponent: FunctionComponent<{item: ToolbarItem}> = ({item}) => {
    const {onClick, color, label} = item
    if (!onClick) {
        return <span style={{color: color || 'gray'}}>{label}&nbsp;&nbsp;&nbsp;</span>
    }
    return (
        <span>
            <Hyperlink onClick={onClick} color={color || 'gray'}>
                {label}
            </Hyperlink>
            &nbsp;&nbsp;&nbsp;
        </span>
    )
}

const LowerABit: FunctionComponent<PropsWithChildren<{numPixels: number}>> = ({children, numPixels}) => {
    return (
        <span style={{position: 'relative', top: numPixels}}>
            {children}
        </span>
    )
}

const NotSelectable: FunctionComponent<PropsWithChildren> = ({children}) => {
    return (
        <div style={{userSelect: 'none'}}>
            {children}
        </div>
    )
}


export default TextEditor