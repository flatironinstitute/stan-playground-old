import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";
import { useAnalysis } from "../AnalysisPageContext";
import ScriptJobsTable from "./ScriptJobsTable";

type Props = {
    width: number,
    height: number,
    fileName: string
}

const ScriptJobsWindow: FunctionComponent<Props> = ({ width, height, fileName }) => {
    const {workspaceRole, workspace} = useWorkspace()
    const {refreshScriptJobs, createScriptJob, deleteCompletedScriptJobs} = useAnalysis()

    const handleCreateJob = useCallback(async () => {
        createScriptJob({scriptFileName: fileName})
    }, [createScriptJob, fileName])

    const [createJobTitle, setCreateJobTitle] = useState('Run script')

    const canCreateJob = useMemo(() => {
        if (workspaceRole === 'admin' || workspaceRole === 'editor') {
            if (workspace?.computeResourceId) {
                return true
            }
            else {
                setCreateJobTitle('You must set a compute resource for this workspace before you can run scripts.')
            }
        }
        else {
            setCreateJobTitle('You do not have permission to run scripts for this analysis.')
        }
        return false
    }, [workspaceRole, workspace])

    return (
        <>
            <div>
                <button
                    onClick={handleCreateJob}
                    disabled={!canCreateJob}
                    title={createJobTitle}
                >
                    Run script
                </button>
                <button onClick={refreshScriptJobs}>
                    Refreh
                </button>
                <button onClick={() => deleteCompletedScriptJobs({scriptFileName: fileName})}>
                    Delete completed jobs
                </button>
            </div>
            <ScriptJobsTable
                fileName={fileName}
            />
        </>
    )
}

export default ScriptJobsWindow