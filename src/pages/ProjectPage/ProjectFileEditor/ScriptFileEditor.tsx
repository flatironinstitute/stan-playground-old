import { FunctionComponent } from "react";
import Splitter from "../../../components/Splitter";
import ScriptJobsWindow from "../ScriptJobsWindow/ScriptJobsWindow";
import SpaFileEditor from "./SpaFileEditor";
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

const ScriptFileEditor: FunctionComponent<Props> = ({fileName, fileContent, setFileContent, readOnly, onDeleteFile, width, height}) => {
    const fileType = fileName.split('.').pop()
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
        >
            {
                fileType === 'py' ? (
                    <TextEditor
                        width={0}
                        height={0}
                        language={
                            fileType === 'py' ? 'python' :
                            fileType === 'spa' ? 'yaml' :
                            'text'
                        }
                        label={fileName}
                        text={fileContent}
                        onSetText={setFileContent}
                        readOnly={readOnly}
                        onDeleteFile={onDeleteFile}
                    />
                ) : (
                    <SpaFileEditor
                        width={0}
                        height={0}
                        text={fileContent}
                        onSetText={setFileContent}
                        readOnly={readOnly}
                    />
                )
            }
            <ScriptJobsWindow
                width={0}
                height={0}
                fileName={fileName}
            />
        </Splitter>
    )
}

export default ScriptFileEditor