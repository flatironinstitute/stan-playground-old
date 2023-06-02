import { Delete, PlayArrow, Refresh } from "@mui/icons-material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import SmallIconButton from "../../../components/SmallIconButton";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";
import { useProject } from "../ProjectPageContext";
import ScriptJobsTable from "./ScriptJobsTable";

type Props = {
    width: number,
    height: number,
    fileName: string
}

const ScriptJobsWindow: FunctionComponent<Props> = ({ width, height, fileName }) => {
    const {workspaceRole} = useWorkspace()
    const {refreshScriptJobs, createScriptJob, deleteCompletedScriptJobs, scriptJobs} = useProject()

    const handleCreateJob = useCallback(async () => {
        createScriptJob({scriptFileName: fileName})
    }, [createScriptJob, fileName])

    const [createJobTitle, setCreateJobTitle] = useState('Run script')

    const canCreateJob = useMemo(() => {
        if (!scriptJobs) return false // not loaded yet
        const pendingJob = scriptJobs.find(jj => (jj.scriptFileName === fileName && jj.status === 'pending'))
        const runningJob = scriptJobs.find(jj => (jj.scriptFileName === fileName && jj.status === 'running'))
        if ((pendingJob) || (runningJob)) {
            setCreateJobTitle('A job is already pending or running for this script.')
            return false
        }
        if (workspaceRole === 'admin' || workspaceRole === 'editor') {
            setCreateJobTitle('Create job')
            return true
        }
        else {
            setCreateJobTitle('You do not have permission to run scripts for this project.')
        }
        return false
    }, [workspaceRole, scriptJobs, fileName])

    const handleDeleteCompletedJobs = useCallback(async () => {
        const okay = await confirm('Delete all completed or failed jobs?')
        if (!okay) return
        deleteCompletedScriptJobs({scriptFileName: fileName})
    }, [deleteCompletedScriptJobs, fileName])

    const iconFontSize = 20

    return (
        <>
            <div>
                <SmallIconButton
                    icon={<PlayArrow />}
                    onClick={handleCreateJob}
                    disabled={!canCreateJob}
                    title={createJobTitle}
                    label="Run"
                    fontSize={iconFontSize}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <SmallIconButton
                    icon={<Refresh />}
                    onClick={refreshScriptJobs}
                    title="Refresh jobs"
                    label="Refresh"
                    fontSize={iconFontSize}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <SmallIconButton
                    icon={<Delete />}
                    onClick={handleDeleteCompletedJobs}
                    title="Delete completed or failed jobs"
                    label="Delete completed jobs"
                    fontSize={iconFontSize}
                />
            </div>
            <ScriptJobsTable
                fileName={fileName}
            />
        </>
    )
}

export default ScriptJobsWindow