import { FunctionComponent } from "react";
import TextEditor from "./TextEditor";

type Props = {
    fileName: string
    fileContent: string
    setFileContent: (text: string) => void
    width: number
    height: number
}

const TextFileEditor: FunctionComponent<Props> = ({fileName, fileContent, setFileContent, width, height}) => {
    const readOnly = false

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
    ) : 'text'

    return (
        <TextEditor
            width={width}
            height={height}
            language={language}
            label={fileName}
            text={fileContent}
            onSetText={setFileContent}
            // onReload=
            readOnly={readOnly}
        />
    )
}

export default TextFileEditor