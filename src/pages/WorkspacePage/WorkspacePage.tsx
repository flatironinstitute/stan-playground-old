import { FunctionComponent } from "react";
import AnalysesMenuBar from "./AnalysesMenuBar";
import AnalysesTable from "./AnalysesTable";
import BackButton from "./BackButton";
import { SetupWorkspacePage } from "./WorkspacePageContext";

type Props = {
    workspaceId: string
}

const WorkspacePage: FunctionComponent<Props> = ({workspaceId}) => {
    return (
        <SetupWorkspacePage
            workspaceId={workspaceId}
        >
            <BackButton />
            <div>Workspace: {workspaceId}</div>
            <AnalysesMenuBar />
            <AnalysesTable />
        </SetupWorkspacePage>
    )
}

export default WorkspacePage