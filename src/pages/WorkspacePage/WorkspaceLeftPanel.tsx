import { Edit } from "@mui/icons-material";
import { FunctionComponent } from "react";
import { useModalDialog } from "../../ApplicationBar";
import ModalWindow from "../../components/ModalWindow/ModalWindow";
import SmallIconButton from "../../components/SmallIconButton";
import ComputeResourceIdComponent from "../../ComputeResourceIdComponent";
import UserIdComponent from "../../UserIdComponent";
import BackButton from "./BackButton";
import { useWorkspace } from "./WorkspacePageContext";
import WorkspaceSettingsWindow from "./WorkspaceSettingsWindow";

type Props = {
    width: number
    height: number
}

const WorkspaceLeftPanel: FunctionComponent<Props> = ({ width, height }) => {
    const {workspaceId, workspace, workspaceRole, setWorkspaceProperty} = useWorkspace()
    const {visible: settingsWindowVisible, handleOpen: openSettingsWindow, handleClose: closeSettingsWindow} = useModalDialog()
    const padding = 10
    const W = width - 2 * padding
    const H = height - 2 * padding

    const handleEditProjectName = useCallback(async () => {
        const newName = await prompt('Enter new workspace name:', workspace?.name || '')
        if (!newName) return
        setWorkspaceProperty('name', newName)
    }, [workspace, setWorkspaceProperty])

    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: W, height: H}}>
            <div>
                <BackButton />
                <hr />
                <div style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    Workspace: {workspace?.name}
                    {
                        (workspaceRole === 'admin' || workspaceRole === 'editor') && (
                            <SmallIconButton onClick={handleEditWorkspaceName} title="Edit workspace name" icon={<Edit />} />
                        )
                    }
                </div>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>ID:</td>
                        <td>{workspaceId}</td>
                    </tr>
                    <tr>
                        <td>Owner:</td>
                        <td><UserIdComponent userId={workspace?.ownerId} /></td>
                    </tr>
                    <tr>
                        <td>Compute:</td>
                        <td><ComputeResourceIdComponent computeResourceId={workspace?.computeResourceId} /></td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <button onClick={openSettingsWindow}>Settings</button>
            <ModalWindow
                open={settingsWindowVisible}
                onClose={closeSettingsWindow}
            >
                <WorkspaceSettingsWindow />
            </ModalWindow>
        </div>
    )
}

export default WorkspaceLeftPanel