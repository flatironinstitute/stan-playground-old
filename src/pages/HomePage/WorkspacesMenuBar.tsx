import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { prompt } from "../../confirm_prompt_alert";
import { useGithubAuth } from "../../GithubAuth/useGithubAuth";
import { useSPMain } from "../../SPMainContext";

type Props = {
    // none
}

const WorkspacesMenuBar: FunctionComponent<Props> = () => {
    const {createWorkspace} = useSPMain()

    const handleCreateWorkspace = useCallback(() => {
        (async () => {
            const workspaceName = await prompt("Enter workspace name", "")
            if (workspaceName) {
                await createWorkspace(workspaceName)
            }
        })()
    }, [createWorkspace])

    const {userId} = useGithubAuth()
    
    return (
        <div>
            {
                userId ? (
                    <Hyperlink onClick={handleCreateWorkspace}>Create workspace</Hyperlink>
                ) : (
                    <span style={{cursor: 'default'}}>Log in to create a workspace</span>
                )
            }
        </div>
    )
}

export default WorkspacesMenuBar