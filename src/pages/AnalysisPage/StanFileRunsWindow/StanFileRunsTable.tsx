import { Delete } from "@mui/icons-material";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../../components/Hyperlink";
import { confirm } from "../../../confirm_prompt_alert";
import { SPAnalysisRun } from "../../../types/stan-playground-types";
import { timeAgoString } from "../../../timeStrings";
import { useAnalysis } from "../AnalysisPageContext";

type Props = {
    fileName: string
}

const StanFileRunsTable: FunctionComponent<Props> = ({ fileName }) => {
    const {analysisRuns, openTab} = useAnalysis()
    return (
        <table className="scientific-table" style={{fontSize: 12}}>
            <thead>
                <tr>
                    <th />
                    <th>Run</th>
                    <th>Program</th>
                    <th>Dataset</th>
                    <th>Compute</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {
                    analysisRuns?.filter(ar => (ar.stanProgramFileName === fileName)).map((run) => (
                        <tr key={run.analysisRunId}>
                            <td><RunRowActions run={run} /></td>
                            <td>
                                <Hyperlink onClick={() => openTab(`run:${run.analysisRunId}`)}>
                                    {run.analysisRunId}
                                </Hyperlink>
                            </td>
                            <td>{run.stanProgramFileName}</td>
                            <td>{run.datasetFileName}</td>
                            <td>{run.computeResourceId}</td>
                            <td>{run.status}</td>
                            <td>{timeAgoString(run.timestampCreated)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

const RunRowActions: FunctionComponent<{run: SPAnalysisRun}> = ({run}) => {
    const {deleteAnalysisRun} = useAnalysis()
    const handleDelete = useCallback(async () => {
        const okay = await confirm('Delete this analysis run?')
        if (!okay) return
        deleteAnalysisRun(run.analysisRunId)
    }, [run, deleteAnalysisRun])
    return (
        <span>
            <Delete onClick={handleDelete} />
        </span>
    )
}

export default StanFileRunsTable