import { FunctionComponent } from "react";
import ApplicationBar, { applicationBarHeight } from "./ApplicationBar";
import GitHubAuthPage from "./GitHub/GitHubAuthPage";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import ComputeResourcesPage from "./pages/ComputeResourcesPage/ComputeResourcesPage";
import HomePage from "./pages/HomePage/HomePage";
import RegisterComputeResourcePage from "./pages/RegisterComputeResourcePage/RegisterComputeResourcePage";
import WorkspacePage from "./pages/WorkspacePage/WorkspacePage";
import useRoute from "./useRoute";
import useWindowDimensions from "./useWindowDimensions";
import { SetupSPMain } from "./SPMainContext";

type Props = {
    // none
}

const MainWindow: FunctionComponent<Props> = () => {
    const {route} = useRoute()
    const {width, height} = useWindowDimensions()
    return (
        <SetupSPMain>
            <div style={{position: 'absolute', width, height}}>
                <div style={{position: 'absolute', width, height: applicationBarHeight}}>
                    <ApplicationBar />
                </div>
                <div style={{position: 'absolute', top: applicationBarHeight, width, height: height - applicationBarHeight}}>
                    {
                        route.page === 'home' ? (
                            <HomePage />
                        ) : route.page === 'workspace' ? (
                            <WorkspacePage workspaceId={route.workspaceId} width={width} height={height - applicationBarHeight} />
                        ) : route.page === 'project' ? (
                            <ProjectPage projectId={route.projectId} width={width} height={height - applicationBarHeight} />
                        ) : route.page === 'github-auth' ? (
                            <GitHubAuthPage />
                        ) : route.page === 'compute-resources' ? (
                            <ComputeResourcesPage width={width} height={height} />
                        ) : route.page === 'register-compute-resource' ? (
                            <RegisterComputeResourcePage />
                        ) : (
                            <div>404</div>
                        )
                    }
                </div>
            </div>
        </SetupSPMain>
    )
}

export default MainWindow