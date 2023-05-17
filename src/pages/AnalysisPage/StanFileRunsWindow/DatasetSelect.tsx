import { FunctionComponent, useMemo } from "react";
import { SPAnalysisFile } from "../../../types/stan-playground-types";
import { useAnalysis } from "../AnalysisPageContext";

type Props = {
    selectedDatasetFileName: string,
    setSelectedDatasetFileName: (fileName: string) => void
}

const DatasetSelect: FunctionComponent<Props> = ({selectedDatasetFileName, setSelectedDatasetFileName}) => {
    const {analysisFiles} = useAnalysis()
    const datasetFiles: SPAnalysisFile[] = useMemo(() => {
        if (analysisFiles === undefined) return []
        return analysisFiles.filter(f => f.fileName.endsWith('.json'))
    }, [analysisFiles])
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