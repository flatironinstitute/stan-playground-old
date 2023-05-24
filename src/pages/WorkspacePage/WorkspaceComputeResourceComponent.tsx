import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent } from "react";
import ComputeResourceIdComponent from "../../ComputeResourceIdComponent";
import { useComputeResources } from "../ComputeResourcesPage/ComputeResourcesContext";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const WorkspaceComputeResourceComponent: FunctionComponent<Props> = () => {
    const {workspace, workspaceRole, setWorkspaceProperty} = useWorkspace()

    return (
        <div>
            {
                workspace?.computeResourceId ? (
                    <table>
                        <tbody>
                            <tr>
                                <td>Using compute resource:</td>
                                <td><ComputeResourceIdComponent computeResourceId={workspace?.computeResourceId} /></td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <span>No compute resource selected for this workspace</span>
                )
            }
            {
                workspaceRole === 'admin' && (
                    <SelectComputeResourceComponent
                        onSelected={(computeResourceId) => {
                            if (!computeResourceId) return
                            setWorkspaceProperty('computeResourceId', computeResourceId)
                        }}
                    />
                )
            }
            {
                workspaceRole === 'admin' && workspace?.computeResourceId && (
                    <IconButton onClick={() => setWorkspaceProperty('computeResourceId', '')} title="Remove this compute resource"><Delete /></IconButton>
                )
            }
        </div>
    )
}

type SelectComputeResourceComponentProps = {
    onSelected: (computeResourceId: string) => void
}

const SelectComputeResourceComponent: FunctionComponent<SelectComputeResourceComponentProps> = ({onSelected}) => {
    const {computeResources} = useComputeResources()
    return (
        <div>
            <select onChange={e => onSelected(e.target.value)}>
                <option value="">Select a compute resource</option>
                {
                    computeResources.map(cr => (
                        <option key={cr.computeResourceId} value={cr.computeResourceId}>{cr.name} ({abbreviate(cr.computeResourceId, 10)})</option>
                    ))
                }
            </select>
        </div>
    )
}

function abbreviate(s: string, maxLength: number) {
    if (s.length <= maxLength) return s
    return s.slice(0, maxLength - 3) + '...'
}

export default WorkspaceComputeResourceComponent;