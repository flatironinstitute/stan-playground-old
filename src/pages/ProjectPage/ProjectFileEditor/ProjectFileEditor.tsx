import { FunctionComponent, useCallback } from "react";
import { useProject } from "../ProjectPageContext";
import ScriptFileEditor from "./ScriptFileEditor";
import StanFileEditor from "./StanFileEditor";
import TextFileEditor from "./TextFileEditor";
import useProjectFile from "./useProjectFile";

type Props = {
    fileName: string
    readOnly: boolean
    onFileDeleted: () => void
    width: number
    height: number
}

const ProjectFileEditor: FunctionComponent<Props> = ({fileName, readOnly, onFileDeleted, width, height}) => {
    const {project, projectId} = useProject()

    const {fileContent, setFileContent, deleteFile} = useProjectFile(project?.workspaceId || '', projectId, fileName)

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
    else if (fileName.endsWith('.py') || fileName.endsWith('.spa')) {
        return (
            <ScriptFileEditor
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

export default ProjectFileEditor