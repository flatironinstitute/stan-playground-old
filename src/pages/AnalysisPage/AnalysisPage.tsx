import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import AnalysisLeftPanel from "./AnalysisLeftPanel";
import AnalysisMainPanel from "./AnalysisMainPanel";
import { SetupAnalysisPage } from "./AnalysisPageContext";

type Props = {
    width: number
    height: number
    analysisId: string
}

const WorkspacePage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    const initialPosition = Math.max(200, Math.min(500, width / 4))
    return (
        <SetupAnalysisPage
            analysisId={analysisId}
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
        </SetupAnalysisPage>
    )
}

export default WorkspacePage