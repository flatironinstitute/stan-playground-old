import { FunctionComponent, useCallback } from "react";
import { confirm } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import BackButton from "./BackButton";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    width: number
    height: number
}

const WorkspaceLeftPanel: FunctionComponent<Props> = ({ width, height }) => {
    const {workspaceId, deleteWorkspace} = useWorkspace()
    const {setRoute} = useRoute()

    const handleDeleteWorkspace = useCallback(async () => {
        const okay = await confirm('Are you sure you want to delete this workspace?')
        if (!okay) return
        await deleteWorkspace()
        setRoute({page: 'home'})
    }, [deleteWorkspace, setRoute])
    return (
        <div>
            <BackButton />
            <div>Workspace: {workspaceId}</div>
            <hr />
            <button onClick={handleDeleteWorkspace}>Delete workspace</button>
        </div>
    )
}

export default WorkspaceLeftPanel;