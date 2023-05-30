import { FunctionComponent } from "react";
import TextEditor from "./TextEditor";

type Props = {
    fileName: string
    fileContent: string
    setFileContent: (text: string) => void
    readOnly: boolean
    onDeleteFile?: () => void
    width: number
    height: number
}

const TextFileEditor: FunctionComponent<Props> = ({fileName, fileContent, setFileContent, readOnly, onDeleteFile, width, height}) => {
    const language = fileName.endsWith('.json') ? (
        'json'
    ) : fileName.endsWith('.yaml') ? (
        'yaml'
    ) : fileName.endsWith('.yml') ? (
        'yaml'
    ) : fileName.endsWith('.py') ? (
        'python'
    ) : fileName.endsWith('.js') ? (
        'javascript'
    ) : fileName.endsWith('.md') ? (
        'markdown'
    ) : 'text'

    const wordWrap = language === 'json' || language === 'markdown'

    return (
        <TextEditor
            width={width}
            height={height}
            language={language}
            label={fileName}
            text={fileContent}
            onSetText={setFileContent}
            wordWrap={wordWrap}
            // onReload=
            readOnly={readOnly}
            onDeleteFile={onDeleteFile}
        />
    )
}

export default TextFileEditor