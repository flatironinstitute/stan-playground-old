import { FunctionComponent } from "react";
import { useModalDialog } from "../../ApplicationBar";
import ModalWindow from "../../components/ModalWindow/ModalWindow";
import BackButton from "./BackButton";
import { useWorkspace } from "./WorkspacePageContext";
import WorkspaceSettingsWindow from "./WorkspaceSettingsWindow";

type Props = {
    width: number
    height: number
}

const WorkspaceLeftPanel: FunctionComponent<Props> = ({ width, height }) => {
    const {workspaceId} = useWorkspace()
    const {visible: settingsWindowVisible, handleOpen: openSettingsWindow, handleClose: closeSettingsWindow} = useModalDialog()
    return (
        <div>
            <BackButton />
            <div>Workspace: {workspaceId}</div>
            <hr />
            <button onClick={() => openSettingsWindow()}>Workspace Settings</button>
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