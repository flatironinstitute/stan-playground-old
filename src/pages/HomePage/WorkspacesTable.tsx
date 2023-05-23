import { FunctionComponent } from "react";
import Hyperlink from "../../components/Hyperlink";
import { timeAgoString } from "../../timeStrings";
import UserIdComponent from "../../UserIdComponent";
import useRoute from "../../useRoute";
import { useHome } from "./HomePageContext";

type Props = {
    // none
}

const WorkspacesTable: FunctionComponent<Props> = () => {
    const {workspaces} = useHome()
    const {setRoute} = useRoute()

    return (
        <table className="scientific-table">
            <thead>
                <tr>
                    <th>Workspace</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Modified</th>
                    </tr>
            </thead>
            <tbody>
                    {workspaces.map(workspace => (
                        <tr key={workspace.workspaceId}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'workspace', workspaceId: workspace.workspaceId})}>
                                    {workspace.name}
                                </Hyperlink>
                            </td>
                            <td><UserIdComponent userId={workspace.ownerId} /></td>
                            <td>{timeAgoString(workspace.timestampCreated)}</td>
                            <td>{timeAgoString(workspace.timestampModified)}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}

export default WorkspacesTable