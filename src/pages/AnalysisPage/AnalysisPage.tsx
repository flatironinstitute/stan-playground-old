import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import { SetupWorkspacePage } from "../WorkspacePage/WorkspacePageContext";
import AnalysisLeftPanel from "./AnalysisLeftPanel";
import AnalysisMainPanel from "./AnalysisMainPanel";
import { SetupAnalysisPage, useAnalysis } from "./AnalysisPageContext";

type Props = {
    width: number
    height: number
    analysisId: string
}

const WorkspacePage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    return (
        <SetupAnalysisPage
            analysisId={analysisId}
        >
            <WorkspacePageChild
                width={width}
                height={height}
                analysisId={analysisId}
            />
        </SetupAnalysisPage>
    )
}

const WorkspacePageChild: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceId} = useAnalysis()
    const initialPosition = Math.max(200, Math.min(500, width / 4))
    return (
        <SetupWorkspacePage
            workspaceId={workspaceId}
        >
            <Splitter
                width={width}
                height={height}
                initialPosition={initialPosition}
                direction='horizontal'
            >
                <AnalysisLeftPanel width={0} height={0} />
                <AnalysisMainPanel width={0} height={0} />
            </Splitter>
        </SetupWorkspacePage>
    )
}   

export default WorkspacePage