import { FunctionComponent } from "react";
import { useModalDialog } from "../../ApplicationBar";
import ModalWindow from "../../components/ModalWindow/ModalWindow";
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
    const {workspaceId, workspace} = useWorkspace()
    const {visible: settingsWindowVisible, handleOpen: openSettingsWindow, handleClose: closeSettingsWindow} = useModalDialog()
    const padding = 10
    const W = width - 2 * padding
    const H = height - 2 * padding
    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: W, height: H}}>
            <div>
                <BackButton />
                <div style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    Workspace: {workspace?.name}
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