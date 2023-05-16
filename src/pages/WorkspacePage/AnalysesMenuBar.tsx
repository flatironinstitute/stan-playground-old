import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { confirm } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const AnalysesMenuBar: FunctionComponent<Props> = () => {
    const {createAnalysis} = useWorkspace()
    const {setRoute} = useRoute()

    const handleCreateAnalysis = useCallback(() => {
        (async () => {
            const okay = await confirm("Create new analysis?")
            if (!okay) return
            const analysisId = await createAnalysis()
            setRoute({page: 'analysis', analysisId})
        })()
    }, [createAnalysis, setRoute])
    
    return (
        <div>
            <Hyperlink onClick={handleCreateAnalysis}>Add Analysis</Hyperlink>
        </div>
    )
}

export default AnalysesMenuBar