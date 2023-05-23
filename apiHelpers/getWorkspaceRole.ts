import { SPWorkspace } from "../src/types/stan-playground-types"

const getWorkspaceRole = (workspace: SPWorkspace, userId: string | undefined) => {
    if (!userId) {
        return workspace.anonymousUserRole
    }
    if (workspace.ownerId === userId) {
        return 'admin'
    }
    const user = workspace.users.find(x => x.userId === userId)
    if (user) {
        return user.role
    }
    return workspace.loggedInUserRole
}

export default getWorkspaceRole