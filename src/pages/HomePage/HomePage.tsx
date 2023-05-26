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
            <h1>Welcome to Stan Playground</h1>
            <p>
                Stan Playground is an interactive website designed to help you learn, 
                experiment with and share your work in the Stan programming language. Here, 
                you can create, visualize and run Stan code in an intuitive and 
                user-friendly environment.
            </p>

            <h2>Workspaces</h2>
            <WorkspacesMenuBar />
            <WorkspacesTable />
            <hr />
            <p><Hyperlink onClick={() => setRoute({page: 'compute-resources'})}>Manage your compute resources</Hyperlink></p>
        </div>
    )
}

export default HomePage