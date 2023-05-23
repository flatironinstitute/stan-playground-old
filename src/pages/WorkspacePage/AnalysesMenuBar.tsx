import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { confirm, prompt } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const AnalysesMenuBar: FunctionComponent<Props> = () => {
    const {createAnalysis, workspaceRole} = useWorkspace()
    const {setRoute} = useRoute()

    const handleCreateAnalysis = useCallback(() => {
        (async () => {
            const analysisName = await prompt('Enter analysis name:', 'Untitled')
            if (!analysisName) return
            const analysisId = await createAnalysis(analysisName)
            setRoute({page: 'analysis', analysisId})
        })()
    }, [createAnalysis, setRoute])
    
    return (
        <div>
            {
                workspaceRole === 'admin' || workspaceRole === 'editor' ? (
                    <Hyperlink onClick={handleCreateAnalysis}>Add Analysis</Hyperlink>
                ) : (
                    <span>&nbsp;</span>
                )
            }
        </div>
    )
}

export default AnalysesMenuBar