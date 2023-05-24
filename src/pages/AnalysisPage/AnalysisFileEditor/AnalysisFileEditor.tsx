import { FunctionComponent } from "react";
import { useAnalysis } from "../AnalysisPageContext";
import PyFileEditor from "./PyFileEditor";
import StanFileEditor from "./StanFileEditor";
import TextFileEditor from "./TextFileEditor";
import useAnalysisFile from "./useAnalysisFile";

type Props = {
    fileName: string
    readOnly: boolean
    width: number
    height: number
}

const AnalysisFileEditor: FunctionComponent<Props> = ({fileName, readOnly, width, height}) => {
    const {analysis, analysisId} = useAnalysis()

    const {fileContent, setFileContent} = useAnalysisFile(analysis?.workspaceId || '', analysisId, fileName)

    if (fileName.endsWith('.stan')) {
        return (
            <StanFileEditor
                fileName={fileName}
                fileContent={fileContent || ''}
                setFileContent={setFileContent}
                readOnly={readOnly}
                width={width}
                height={height}
            />
        )
    }
    else if (fileName.endsWith('.py')) {
        return (
            <PyFileEditor
                fileName={fileName}
                fileContent={fileContent || ''}
                setFileContent={setFileContent}
                readOnly={readOnly}
                width={width}
                height={height}
            />
        )
    }
    else {
        return (
            <TextFileEditor
                fileName={fileName}
                fileContent={fileContent || ''}
                setFileContent={setFileContent}
                readOnly={readOnly}
                width={width}
                height={height}
            />
        )
    }
}

export default AnalysisFileEditor