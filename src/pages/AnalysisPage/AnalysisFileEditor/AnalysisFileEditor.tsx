import { FunctionComponent } from "react";
import { useAnalysis } from "../AnalysisPageContext";
import StanFileEditor from "./StanFileEditor";
import TextFileEditor from "./TextFileEditor";
import useAnalysisFile from "./useAnalysisFile";

type Props = {
    fileName: string
    width: number
    height: number
}

const AnalysisFileEditor: FunctionComponent<Props> = ({fileName, width, height}) => {
    const {analysisId} = useAnalysis()

    const {fileContent, setFileContent} = useAnalysisFile(analysisId, fileName)

    if (fileName.endsWith('.stan')) {
        return (
            <StanFileEditor
                fileName={fileName}
                fileContent={fileContent || ''}
                setFileContent={setFileContent}
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
                width={width}
                height={height}
            />
        )
    }
}

export default AnalysisFileEditor