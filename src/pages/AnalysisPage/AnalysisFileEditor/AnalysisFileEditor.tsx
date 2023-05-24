import { FunctionComponent, useCallback } from "react";
import { useAnalysis } from "../AnalysisPageContext";
import PyFileEditor from "./PyFileEditor";
import StanFileEditor from "./StanFileEditor";
import TextFileEditor from "./TextFileEditor";
import useAnalysisFile from "./useAnalysisFile";

type Props = {
    fileName: string
    readOnly: boolean
    onFileDeleted: () => void
    width: number
    height: number
}

const AnalysisFileEditor: FunctionComponent<Props> = ({fileName, readOnly, onFileDeleted, width, height}) => {
    const {analysis, analysisId} = useAnalysis()

    const {fileContent, setFileContent, deleteFile} = useAnalysisFile(analysis?.workspaceId || '', analysisId, fileName)

    const handleDeleteFile = useCallback(async () => {
        const okay = window.confirm(`Delete ${fileName}?`)
        if (!okay) return
        await deleteFile()
        onFileDeleted()
    }, [deleteFile, onFileDeleted, fileName])

    if (fileName.endsWith('.stan')) {
        return (
            <StanFileEditor
                fileName={fileName}
                fileContent={fileContent || ''}
                setFileContent={setFileContent}
                readOnly={readOnly}
                onDeleteFile={handleDeleteFile}
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
                onDeleteFile={handleDeleteFile}
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
                onDeleteFile={handleDeleteFile}
                width={width}
                height={height}
            />
        )
    }
}

export default AnalysisFileEditor