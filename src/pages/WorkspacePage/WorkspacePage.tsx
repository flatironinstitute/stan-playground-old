import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import WorkspaceLeftPanel from "./WorkspaceLeftPanel";
import WorkspaceMainPanel from "./WorkspaceMainPanel";
import { SetupWorkspacePage } from "./WorkspacePageContext";

type Props = {
    workspaceId: string
    width: number
    height: number
}

const WorkspacePage: FunctionComponent<Props> = ({workspaceId, width, height}) => {
    return (
        <SetupWorkspacePage
            workspaceId={workspaceId}
        >
            <Splitter
                direction="horizontal"
                width={width}
                height={height}
                initialPosition={Math.min(250, width / 2)}
            >
                <WorkspaceLeftPanel width={0} height={0} />
                <WorkspaceMainPanel width={0} height={0} />
            </Splitter>
        </SetupWorkspacePage>
    )
}

export default WorkspacePage