import { FunctionComponent } from "react";
import ApplicationBar, { applicationBarHeight } from "./ApplicationBar";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage";
import HomePage from "./pages/HomePage/HomePage";
import WorkspacePage from "./pages/WorkspacePage/WorkspacePage";
import useRoute from "./useRoute";
import useWindowDimensions from "./useWindowDimensions";

type Props = {
    // none
}

const MainWindow: FunctionComponent<Props> = () => {
    const {route} = useRoute()
    const {width, height} = useWindowDimensions()
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', width, height: applicationBarHeight}}>
                <ApplicationBar />
            </div>
            <div style={{position: 'absolute', top: applicationBarHeight, width, height: height - applicationBarHeight}}>
                {
                    route.page === 'home' ? (
                        <HomePage />
                    ) : route.page === 'workspace' ? (
                        <WorkspacePage workspaceId={route.workspaceId} />
                    ) : route.page === 'analysis' ? (
                        <AnalysisPage analysisId={route.analysisId} width={width} height={height - applicationBarHeight} />
                    ) : (
                        <div>404</div>
                    )
                }
            </div>
        </div>
    )
}

export default MainWindow