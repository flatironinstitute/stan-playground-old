import { FunctionComponent } from "react";
import { useWorkspace } from "../../WorkspacePage/WorkspacePageContext";
import CreateRunComponent from "./CreateRunComponent";
import StanFileRunsTable from "./StanFileRunsTable";

type Props = {
    width: number,
    height: number,
    fileName: string
}

const StanFileRunsWindow: FunctionComponent<Props> = ({ width, height, fileName }) => {
    const {workspaceRole} = useWorkspace()
    return (
        <>
            {
                (workspaceRole === 'admin' || workspaceRole === 'editor') ? (
                    <CreateRunComponent
                        stanFileName={fileName}
                    />
                ) : (
                    <p>You do not have permission to create analysis runs for this analysis.</p>
                )
            }
            <StanFileRunsTable
                fileName={fileName}
            />
        </>
    )
}

export default StanFileRunsWindow