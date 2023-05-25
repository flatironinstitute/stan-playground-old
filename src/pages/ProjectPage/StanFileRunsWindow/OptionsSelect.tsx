import { FunctionComponent, useMemo } from "react";
import { SPProjectFile } from "../../../types/stan-playground-types";
import { useProject } from "../ProjectPageContext";

type Props = {
    selectedOptionsFileName: string,
    setSelectedOptionsFileName: (fileName: string) => void
}

const OptionsSelect: FunctionComponent<Props> = ({selectedOptionsFileName, setSelectedOptionsFileName}) => {
    const {projectFiles} = useProject()
    const optionsFiles: SPProjectFile[] = useMemo(() => {
        if (projectFiles === undefined) return []
        return projectFiles.filter(f => f.fileName.endsWith('.yaml'))
    }, [projectFiles])
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