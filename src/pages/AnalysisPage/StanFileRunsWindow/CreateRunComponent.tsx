import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import { useAnalysis } from "../AnalysisPageContext";
import DatasetSelect from "./DatasetSelect";
import OptionsSelect from "./OptionsSelect";
import "./table1.css";

type Props = {
    stanFileName: string
}

const CreateRunComponent: FunctionComponent<Props> = ({ stanFileName }) => {
    const {createAnalysisRun, analysisFiles} = useAnalysis()

    const [selectedDatasetFileName, setSelectedDatasetFileName] = useState<string | undefined>(undefined)
    const datasetFiles = useMemo(() => {
        if (analysisFiles === undefined) return []
        return analysisFiles.filter(f => f.fileName.endsWith('.json'))
    }, [analysisFiles])
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
        if (analysisFiles === undefined) return []
        return analysisFiles.filter(f => f.fileName.endsWith('.yaml'))
    }, [analysisFiles])
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
        createAnalysisRun({stanFileName, datasetFileName: selectedDatasetFileName, optionsFileName: selectedOptionsFileName})
    }, [stanFileName, selectedDatasetFileName, selectedOptionsFileName, createAnalysisRun])

    return (
        <>
            <h3>Create analysis run</h3>
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