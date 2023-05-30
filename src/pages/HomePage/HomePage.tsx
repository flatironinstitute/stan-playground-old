import { FunctionComponent } from "react";
import Hyperlink from "../../components/Hyperlink";
import useRoute from "../../useRoute";
import "./HomePage.css";
import WorkspacesMenuBar from "./WorkspacesMenuBar";
import WorkspacesTable from "./WorkspacesTable";

type Props = {
    // none
}

const HomePage: FunctionComponent<Props> = () => {
    const { setRoute } = useRoute()
    return (
        <div className="homepage">
            <h1>Stan Playground</h1>
            <p>
                Create, run, and share Stan programs in an intuitive and 
                user-friendly environment. <Hyperlink onClick={() => setRoute({page: 'about'})}>Learn more...</Hyperlink>
            </p>

            <h2>Community Workspaces</h2>
            <WorkspacesTable filter="community" />
            <hr />
            <h2>Your Workspaces</h2>
            <WorkspacesMenuBar />
            <WorkspacesTable filter="user" />
            <p><Hyperlink onClick={() => setRoute({page: 'compute-resources'})}>Manage your compute resources</Hyperlink></p>
        </div>
    )
}

export default HomePage