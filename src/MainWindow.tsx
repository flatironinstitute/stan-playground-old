import { FunctionComponent } from "react";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage";
import HomePage from "./pages/HomePage/HomePage";
import WorkspacePage from "./pages/WorkspacePage/WorkspacePage";
import useRoute from "./useRoute";
import useWindowDimensions from "./useWindowDimensions";

type Props = {
}

const MainWindow: FunctionComponent<Props> = () => {
    const {route} = useRoute()
    const {width, height} = useWindowDimensions()
    return (
        route.page === 'home' ? (
            <HomePage />
        ) : route.page === 'workspace' ? (
            <WorkspacePage workspaceId={route.workspaceId} />
        ) : route.page === 'analysis' ? (
            <AnalysisPage analysisId={route.analysisId} width={width} height={height} />
        ) : (
            <div>404</div>
        )
    )
}

export default MainWindow