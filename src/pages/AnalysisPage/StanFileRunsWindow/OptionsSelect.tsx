import { FunctionComponent, useMemo } from "react";
import { SPAnalysisFile } from "../../../stan-playground-types";
import { useAnalysis } from "../AnalysisPageContext";

type Props = {
    selectedOptionsFileName: string,
    setSelectedOptionsFileName: (fileName: string) => void
}

const OptionsSelect: FunctionComponent<Props> = ({selectedOptionsFileName, setSelectedOptionsFileName}) => {
    const {analysisFiles} = useAnalysis()
    const optionsFiles: SPAnalysisFile[] = useMemo(() => {
        if (analysisFiles === undefined) return []
        return analysisFiles.filter(f => f.fileName.endsWith('.yaml'))
    }, [analysisFiles])
    return (
        <select
            value={selectedOptionsFileName}
            onChange={e => setSelectedOptionsFileName(e.target.value)}
        >
            {
                optionsFiles.map(f => (
                    <option key={f.fileName} value={f.fileName}>{f.fileName}</option>
                ))
            }
        </select>
    )
}

export default OptionsSelect