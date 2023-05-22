import { Delete, Edit } from "@mui/icons-material";
import { FunctionComponent, useCallback, useState } from "react";
import Hyperlink from "../../components/Hyperlink";
import { alert, confirm, prompt } from "../../confirm_prompt_alert";
import { useWorkspace } from "./WorkspacePageContext";

type Props = {
    // none
}

type Role = 'admin' | 'editor' | 'viewer'

const WorkspaceUsersComponent: FunctionComponent<Props> = () => {
    const {workspace, setWorkspaceUsers, setWorkspaceProperty} = useWorkspace()
    
    const handleDeleteUser = useCallback(async (userId: string) => {
        const user = workspace?.users.find(user => user.userId === userId)
        if (!user) return
        const okay = await confirm(`Are you sure you want to delete user ${userId} from this workspace?`)
        if (!okay) return
        await setWorkspaceUsers(workspace?.users.filter(user => user.userId !== userId) || [])
    }, [workspace, setWorkspaceUsers])

    const handleAddUser = useCallback(async () => {
        const userId = await prompt('User ID:', '')
        if (!userId) return
        const role = 'editor' as Role
        if (workspace?.users.find(user => user.userId === userId)) {
            await alert(`User ${userId} already exists`)
            return
        }
        await setWorkspaceUsers([...(workspace?.users || []), {userId, role}])
    }, [workspace, setWorkspaceUsers])

    const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined)

    const handleSetUserRole = useCallback(async (userId: string, role: Role) => {
        const user = workspace?.users.find(user => user.userId === userId)
        if (!user) return
        const newUsers = workspace?.users.map(user => {
            if (user.userId === userId) {
                return {...user, role}
            } else {
                return user
            }
        })
        await setWorkspaceUsers(newUsers || [])
        setEditingUserId(undefined)
    }, [workspace, setWorkspaceUsers])

    const setAnonymousUserRoleHandler = useCallback(async (role: 'none' | 'viewer' | 'editor') => {
        await setWorkspaceProperty('anonymousUserRole', role)
    }, [setWorkspaceProperty])

    const setLoggedInUserRoleHandler = useCallback(async (role: 'none' | 'viewer' | 'editor') => {
        await setWorkspaceProperty('loggedInUserRole', role)
    }, [setWorkspaceProperty])

    return (
        <div>
            <Hyperlink onClick={handleAddUser}>Add user</Hyperlink>
            <table className="scientific-table" style={{maxWidth: 380}}>
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
                                </td>
                                <td>{user.userId}</td>
                                <td>
                                    {
                                        editingUserId !== user.userId ? (
                                            <span>
                                                {user.role}
                                                &nbsp;
                                                {
                                                    editingUserId !== user.userId && (
                                                        <Edit onClick={() => setEditingUserId(user.userId)} />
                                                    )
                                                }
                                            </span>
                                        ) : (
                                            <EditRoleComponent role={user.role} onSetRole={(role) => handleSetUserRole(user.userId, role)} />
                                        )
                                    }
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <hr />
            <table>
                <tbody>
                    <tr>
                        <td>Anonymous users:</td>
                        <td><AnonymousUsersComponent role={workspace?.anonymousUserRole} setRole={setAnonymousUserRoleHandler} /></td>
                    </tr>
                    <tr>
                        <td>Logged-in users:</td>
                        <td><LoggedInUsersComponent role={workspace?.loggedInUserRole} setRole={setLoggedInUserRoleHandler} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const EditRoleComponent: FunctionComponent<{role: Role, onSetRole: (role: Role) => void}> = ({role, onSetRole}) => {
    return (
        <select value={role} onChange={(e) => onSetRole(e.target.value as Role)}>
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
        </select>
    )
}

const AnonymousUsersComponent: FunctionComponent<{role: 'none' | 'viewer' | 'editor' | undefined, setRole: (r: 'none' | 'viewer' | 'editor') => void}> = ({role, setRole}) => {
    return (
        <div>
            <select value={role} onChange={(e) => {
                const newRole = e.target.value as ('none' | 'viewer' | 'editor')
                setRole(newRole)
            }}>
                <option value="none">Anonymous users cannot view</option>
                <option value="viewer">Anonymous users can view</option>
                <option value="editor">Anonymous users can edit</option>
            </select>
        </div>
    )
}

const LoggedInUsersComponent: FunctionComponent<{role: 'none' | 'viewer' | 'editor' | undefined, setRole: (r: 'none' | 'viewer' | 'editor') => void}> = ({role, setRole}) => {
    return (
        <div>
            <select value={role} onChange={(e) => {
                const newRole = e.target.value as ('none' | 'viewer' | 'editor')
                setRole(newRole)
            }}>
                <option value="none">Logged-in users cannot view</option>
                <option value="viewer">Logged-in users can view</option>
                <option value="editor">Logged-in users can edit</option>
            </select>
        </div>
    )
}

export default WorkspaceUsersComponent