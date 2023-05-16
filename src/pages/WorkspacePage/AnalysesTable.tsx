import { FunctionComponent } from "react";
import Hyperlink from "../../components/Hyperlink";
import { timeAgoString } from "../../timeStrings";
import useRoute from "../../useRoute";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const AnalysesTable: FunctionComponent<Props> = () => {
    const {analyses} = useWorkspace()
    const {setRoute} = useRoute()

    return (
        <table className="scientific-table">
            <thead>
                <tr>
                    <th>Analysis</th>
                    <th>Created</th>
                    <th>Modified</th>
                    </tr>
            </thead>
            <tbody>
                    {analyses.map(analysis => (
                        <tr key={analysis.analysisId}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'analysis', analysisId: analysis.analysisId})}>
                                    {analysis.name}
                                </Hyperlink>
                            </td>
                            <td>{timeAgoString(analysis.timestampCreated)}</td>
                            <td>{timeAgoString(analysis.timestampModified)}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}

export default AnalysesTable