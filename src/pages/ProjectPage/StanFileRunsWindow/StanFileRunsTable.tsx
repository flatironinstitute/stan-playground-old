import { Delete } from "@mui/icons-material";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../../components/Hyperlink";
import { confirm } from "../../../confirm_prompt_alert";
import { SPProjectRun } from "../../../types/stan-playground-types";
import { timeAgoString } from "../../../timeStrings";
import { useProject } from "../ProjectPageContext";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";

type Props = {
    fileName: string
}

const StanFileRunsTable: FunctionComponent<Props> = ({ fileName }) => {
    const {projectRuns, openTab} = useProject()
    const {workspaceRole} = useWorkspace()
    return (
        <table className="scientific-table" style={{fontSize: 12}}>
            <thead>
                <tr>
                    <th />
                    <th>Run</th>
                    <th>Program</th>
                    <th>Dataset</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {
                    projectRuns?.filter(ar => (ar.stanProgramFileName === fileName)).map((run) => (
                        <tr key={run.projectRunId}>
                            <td>{
                                (workspaceRole === 'admin' || workspaceRole === 'editor') && (
                                    <RunRowActions run={run} />
                                )
                            }</td>
                            <td>
                                <Hyperlink onClick={() => openTab(`run:${run.projectRunId}`)}>
                                    {run.projectRunId}
                                </Hyperlink>
                            </td>
                            <td>{run.stanProgramFileName}</td>
                            <td>{run.datasetFileName}</td>
                            <td>{run.status}</td>
                            <td>{timeAgoString(run.timestampCreated)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

const RunRowActions: FunctionComponent<{run: SPProjectRun}> = ({run}) => {
    const {deleteProjectRun} = useProject()
    const handleDelete = useCallback(async () => {
        const okay = await confirm('Delete this project run?')
        if (!okay) return
        deleteProjectRun(run.projectRunId)
    }, [run, deleteProjectRun])
    return (
        <span>
            <Delete onClick={handleDelete} />
        </span>
    )
}

export default StanFileRunsTable