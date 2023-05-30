import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { confirm, prompt } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const ProjectsMenuBar: FunctionComponent<Props> = () => {
    const {createProject, workspaceRole} = useWorkspace()
    const {setRoute} = useRoute()

    const handleCreateProject = useCallback(() => {
        (async () => {
            const projectName = await prompt('Enter project name:', 'Untitled')
            if (!projectName) return
            const projectId = await createProject(projectName)
            setRoute({page: 'project', projectId})
        })()
    }, [createProject, setRoute])
    
    return (
        <div>
            {
                workspaceRole === 'admin' || workspaceRole === 'editor' ? (
                    <Hyperlink onClick={handleCreateProject}>Create Project</Hyperlink>
                ) : (
                    <span>&nbsp;</span>
                )
            }
        </div>
    )
}

export default ProjectsMenuBar