import { Delete } from "@mui/icons-material";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../../components/Hyperlink";
import SmallIconButton from "../../../components/SmallIconButton";
import { confirm } from "../../../confirm_prompt_alert";
import { timeAgoString } from "../../../timeStrings";
import { SPScriptJob } from "../../../types/stan-playground-types";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";
import { useProject } from "../ProjectPageContext";

type Props = {
    fileName: string
}

const ScriptJobsTable: FunctionComponent<Props> = ({ fileName }) => {
    const {scriptJobs, openTab} = useProject()
    const {workspaceRole} = useWorkspace()
    return (
        <table className="scientific-table" style={{fontSize: 12}}>
            <thead>
                <tr>
                    <th />
                    <th>Job</th>
                    <th>Script</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {
                    scriptJobs?.filter(jj => (jj.scriptFileName === fileName)).map((jj) => (
                        <tr key={jj.scriptJobId}>
                            <td>{
                                (workspaceRole === 'admin' || workspaceRole === 'editor') && (
                                    <JobRowActions job={jj} />
                                )
                            }</td>
                            <td>
                                <Hyperlink onClick={() => openTab(`scriptJob:${jj.scriptJobId}`)}>
                                    {jj.scriptJobId}
                                </Hyperlink>
                            </td>
                            <td>{jj.scriptFileName}</td>
                            <td>{jj.status}</td>
                            <td>{timeAgoString(jj.timestampCreated)}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

const JobRowActions: FunctionComponent<{job: SPScriptJob}> = ({job}) => {
    const {deleteScriptJob} = useProject()
    const handleDelete = useCallback(async () => {
        const okay = await confirm('Delete this job?')
        if (!okay) return
        deleteScriptJob(job.scriptJobId)
    }, [job, deleteScriptJob])
    return (
        <span>
            <SmallIconButton
                onClick={handleDelete}
                icon={<Delete />}
                title="Delete this job"
                fontSize={20}
            />
        </span>
    )
}

export default ScriptJobsTable