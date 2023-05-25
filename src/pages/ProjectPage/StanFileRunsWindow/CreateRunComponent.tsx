import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "../ProjectPageContext";
import DatasetSelect from "./DatasetSelect";
import OptionsSelect from "./OptionsSelect";
import "./table1.css";

type Props = {
    stanFileName: string
}

const CreateRunComponent: FunctionComponent<Props> = ({ stanFileName }) => {
    const {createProjectRun, projectFiles} = useProject()
    

    const [selectedDatasetFileName, setSelectedDatasetFileName] = useState<string | undefined>(undefined)
    const datasetFiles = useMemo(() => {
        if (projectFiles === undefined) return []
        return projectFiles.filter(f => f.fileName.endsWith('.json'))
    }, [projectFiles])
    useEffect(() => {
        if (selectedDatasetFileName !== undefined) {
            if (datasetFiles.some(f => f.fileName === selectedDatasetFileName)) {
                return
            }
        }
        if (datasetFiles.length > 0) {
            setSelectedDatasetFileName(datasetFiles[0].fileName)
        }
    }, [datasetFiles, selectedDatasetFileName])

    const [selectedOptionsFileName, setSelectedOptionsFileName] = useState<string | undefined>(undefined)
    const optionsFiles = useMemo(() => {
        if (projectFiles === undefined) return []
        return projectFiles.filter(f => f.fileName.endsWith('.yaml'))
    }, [projectFiles])
    useEffect(() => {
        if (selectedOptionsFileName !== undefined) {
            if (optionsFiles.some(f => f.fileName === selectedOptionsFileName)) {
                return
            }
        }
        if (optionsFiles.length > 0) {
            setSelectedOptionsFileName(optionsFiles[0].fileName)
        }
    }, [optionsFiles, selectedOptionsFileName])

    const queueable = useMemo(() => {
        return selectedDatasetFileName !== undefined && selectedOptionsFileName !== undefined
    }, [selectedDatasetFileName, selectedOptionsFileName])

    const handleQueueRun = useCallback(async () => {
        if (selectedDatasetFileName === undefined || selectedOptionsFileName === undefined) return
        createProjectRun({stanFileName, datasetFileName: selectedDatasetFileName, optionsFileName: selectedOptionsFileName})
    }, [stanFileName, selectedDatasetFileName, selectedOptionsFileName, createProjectRun])

    return (
        <>
            <h3>Create project run</h3>
            <table className="table1">
                <tbody>
                    <tr>
                        <td>Program:</td>
                        <td>{stanFileName}</td>
                    </tr>
                    <tr>
                        <td>Dataset:</td>
                        <td>
                            <DatasetSelect
                                selectedDatasetFileName={selectedDatasetFileName || ''}
                                setSelectedDatasetFileName={setSelectedDatasetFileName}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Options:</td>
                        <td>
                            <OptionsSelect
                                selectedOptionsFileName={selectedOptionsFileName || ''}
                                setSelectedOptionsFileName={setSelectedOptionsFileName}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><button disabled={!queueable} onClick={handleQueueRun}>Queue run</button></td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default CreateRunComponent