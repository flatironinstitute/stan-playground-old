import { FunctionComponent } from "react";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";
import CreateScriptJobComponent from "./CreateScriptJobComponent";
import ScriptJobsTable from "./ScriptJobsTable";

type Props = {
    width: number,
    height: number,
    fileName: string
}

const ScriptJobsWindow: FunctionComponent<Props> = ({ width, height, fileName }) => {
    const {workspaceRole, workspace} = useWorkspace()
    return (
        <>
            {
                (workspaceRole === 'admin' || workspaceRole === 'editor') ? (
                    workspace?.computeResourceId ? (
                        <CreateScriptJobComponent
                            scriptFileName={fileName}
                        />
                    ) : (
                        <p>You must set a compute resource for this workspace before you can run scripts.</p>
                    )
                ) : (
                    <p>You do not have permission to run scripts for this analysis.</p>
                )
            }
            <ScriptJobsTable
                fileName={fileName}
            />
        </>
    )
}

export default ScriptJobsWindow