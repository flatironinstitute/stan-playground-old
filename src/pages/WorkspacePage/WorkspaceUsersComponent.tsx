import { Delete, Edit } from "@mui/icons-material";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../../components/Hyperlink";
import { alert, confirm, prompt } from "../../confirm_prompt_alert";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

const WorkspaceUsersComponent: FunctionComponent<Props> = () => {
    const {workspace, setWorkspaceUsers} = useWorkspace()
    const handleDeleteUser = useCallback(async (userId: string) => {
        const user = workspace?.users.find(user => user.userId === userId)
        if (!user) return
        const okay = await confirm(`Are you sure you want to delete user ${userId} from this workspace?`)
        if (!okay) return
        await setWorkspaceUsers(workspace?.users.filter(user => user.userId !== userId) || [])
    }, [workspace, setWorkspaceUsers])
    const handleEditUser = useCallback(async (userId: string) => {
        const user = workspace?.users.find(user => user.userId === userId)
        if (!user) return
        const role = await prompt(`Role for user ${userId} (admin, editor, viewer):`, user.role)
        if (!role) return
        if (role === user.role) return
        const role0 = role as 'admin' | 'editor' | 'viewer'
        await setWorkspaceUsers(workspace?.users.map(user => user.userId === userId ? {...user, role: role0} : user) || [])
    }, [workspace, setWorkspaceUsers])
    const handleAddUser = useCallback(async () => {
        const userId = await prompt('User ID:', '')
        if (!userId) return
        const role = await prompt(`Role for user ${userId} (admin, editor, viewer):`, 'viewer')
        if (!role) return
        const role0 = role as 'admin' | 'editor' | 'viewer'
        if (workspace?.users.find(user => user.userId === userId)) {
            await alert(`User ${userId} already exists`)
            return
        }
        await setWorkspaceUsers([...(workspace?.users || []), {userId, role: role0}])
    }, [workspace, setWorkspaceUsers])

    return (
        <div>
            <Hyperlink onClick={handleAddUser}>Add user</Hyperlink>
            <table className="scientific-table" style={{maxWidth: 500}}>
                <thead>
                    <tr>
                        <th>
                        </th>
                        <th>User</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        workspace?.users.map(user => (
                            <tr key={user.userId}>
                                <td>
                                <Delete onClick={() => handleDeleteUser(user.userId)} />
                                &nbsp;
                                <Edit onClick={() => handleEditUser(user.userId)} />
                                </td>
                                <td>{user.userId}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>    
        </div>
    )
}

export default WorkspaceUsersComponent