import { FunctionComponent, useMemo } from "react";
import { SPProjectFile } from "../../../types/stan-playground-types";
import { useProject } from "../ProjectPageContext";

type Props = {
    selectedDatasetFileName: string,
    setSelectedDatasetFileName: (fileName: string) => void
}

const DatasetSelect: FunctionComponent<Props> = ({selectedDatasetFileName, setSelectedDatasetFileName}) => {
    const {projectFiles} = useProject()
    const datasetFiles: SPProjectFile[] = useMemo(() => {
        if (projectFiles === undefined) return []
        return projectFiles.filter(f => f.fileName.endsWith('.json'))
    }, [projectFiles])
    return (
        <select
            value={selectedDatasetFileName}
            onChange={e => setSelectedDatasetFileName(e.target.value)}
        >
            {
                datasetFiles.map(f => (
                    <option key={f.fileName} value={f.fileName}>{f.fileName}</option>
                ))
            }
        </select>
    )
}

export default DatasetSelect