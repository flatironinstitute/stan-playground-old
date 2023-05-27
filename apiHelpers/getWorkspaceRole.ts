import { SPWorkspace } from "../src/types/stan-playground-types"

const getWorkspaceRole = (workspace: SPWorkspace, userId: string | undefined) => {
    if (userId) {
        if (workspace.ownerId === userId) {
            return 'admin'
        }
        const user = workspace.users.find(x => x.userId === userId)
        if (user) {
            return user.role
        }
    }
    if (workspace.publiclyReadable) {
        return 'viewer'
    }
    else {
        return 'none'
    }
}

export default getWorkspaceRole