import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { prompt } from "../../confirm_prompt_alert";
import { useGithubAuth } from "../../GithubAuth/useGithubAuth";
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

    const {userId} = useGithubAuth()
    
    return (
        <div>
            {
                userId ? (
                    <Hyperlink onClick={handleCreateWorkspace}>Add Workspace</Hyperlink>
                ) : (
                    <span style={{color: '#aaf', cursor: 'default'}}>Login to create your own workspace</span>
                )
            }
        </div>
    )
}

export default WorkspacesMenuBar