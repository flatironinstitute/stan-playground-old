import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { prompt } from "../../confirm_prompt_alert";
import { useHome } from "./HomePageContext";

type Props = {
    // none
}

const WorkspacesMenuBar: FunctionComponent<Props> = () => {
    const {createWorkspace} = useHome()

    const handleCreateWorkspace = useCallback(() => {
        (async () => {
            const workspaceName = await prompt("Enter workspace name", "")
            if (workspaceName) {
                await createWorkspace(workspaceName)
            }
        })()
    }, [createWorkspace])
    
    return (
        <div>
            <Hyperlink onClick={handleCreateWorkspace}>Add Workspace</Hyperlink>
        </div>
    )
}

export default WorkspacesMenuBar