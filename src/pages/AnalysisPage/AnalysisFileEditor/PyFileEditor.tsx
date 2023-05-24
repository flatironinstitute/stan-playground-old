import { FunctionComponent } from "react";
import Splitter from "../../../components/Splitter";
import ScriptJobsWindow from "../ScriptJobsWindow/ScriptJobsWindow";
import TextEditor from "./TextEditor";

type Props = {
    fileName: string
    fileContent: string
    setFileContent: (text: string) => void
    readOnly: boolean
    width: number
    height: number
}

const PyFileEditor: FunctionComponent<Props> = ({fileName, fileContent, setFileContent, readOnly, width, height}) => {
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
        >
            <TextEditor
                width={0}
                height={0}
                // language="stan"
                language="stan"
                label={fileName}
                text={fileContent}
                onSetText={setFileContent}
                readOnly={readOnly}
            />
            <ScriptJobsWindow
                width={0}
                height={0}
                fileName={fileName}
            />
        </Splitter>
    )
}

export default PyFileEditor