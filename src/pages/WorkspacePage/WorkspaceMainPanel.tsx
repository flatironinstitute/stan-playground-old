import { FunctionComponent } from "react";
import AnalysesMenuBar from "./AnalysesMenuBar";
import AnalysesTable from "./AnalysesTable";

type Props = {
    width: number
    height: number
}

const WorkspaceMainPanel: FunctionComponent<Props> = ({ width, height }) => {
    return (
        <div>
            <AnalysesMenuBar />
            <AnalysesTable />
        </div>
    )
}

export default WorkspaceMainPanel;