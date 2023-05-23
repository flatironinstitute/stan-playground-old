import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { confirm } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import { useWorkspace } from "../WorkspacePage/WorkspacePageContext";
import { useAnalysis } from "./AnalysisPageContext";

type Props = {
    // none
}

const AnalysisSettingsWindow: FunctionComponent<Props> = () => {
    const {analysis} = useAnalysis()
    const {workspace, workspaceRole} = useWorkspace()
    const {setRoute} = useRoute()

    return (
        <div>
            <h3>Analysis Settings for {analysis?.name}</h3>
            <table>
                <tbody>
                    <tr>
                        <td>ID:</td>
                        <td style={{whiteSpace: 'nowrap'}}>{analysis?.analysisId}</td>
                    </tr>
                    <tr>
                        <td>Workspace:</td>
                        <td style={{whiteSpace: 'nowrap'}}><Hyperlink onClick={() => setRoute({page: 'workspace', workspaceId: workspace?.workspaceId || ''})}>{workspace?.name}</Hyperlink></td>
                    </tr>
                </tbody>
            </table>
            <hr />
            {
                (workspaceRole === 'admin' || workspaceRole === 'editor') ? (
                    <DeleteAnalysisButton />
                ) : (
                    <div>You do not have permission to edit this analysis.</div>
                )
            }
        </div>
    )
}

const DeleteAnalysisButton: FunctionComponent = () => {
    const {deleteAnalysis, workspaceId} = useAnalysis()
    const {setRoute} = useRoute()
    const handleDeleteAnalysis = useCallback(async () => {
        const okay = await confirm('Are you sure you want to delete this analysis?')
        if (!okay) return
        await deleteAnalysis()
        setRoute({page: 'workspace', workspaceId})
    }, [deleteAnalysis, setRoute, workspaceId])

    return (
        <button onClick={handleDeleteAnalysis}>Delete analysis</button>
    )
}

export default AnalysisSettingsWindow;