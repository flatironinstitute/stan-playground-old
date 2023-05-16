import { FunctionComponent } from "react";
import { SetupHomePage } from "./HomePageContext";
import WorkspacesMenuBar from "./WorkspacesMenuBar";
import WorkspacesTable from "./WorkspacesTable";

type Props = {
    // none
}

const HomePage: FunctionComponent<Props> = () => {
    return (
        <SetupHomePage>
            <h3>Workspaces</h3>
            <WorkspacesMenuBar />
            <WorkspacesTable />
        </SetupHomePage>
    )
}

export default HomePage