import { SetWorkspaceUsersRequest, SetWorkspaceUsersResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const setWorkspaceUsersHandler = async (request: SetWorkspaceUsersRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<SetWorkspaceUsersResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis')
    }

    const workspaceId = request.workspaceId

    const client = await getMongoClient()

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database (*)')
    }
    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can set the users of a workspace')
    }

    workspace.users = request.users

    await workspacesCollection.updateOne({workspaceId}, {$set: workspace})

    return {
        type: 'setWorkspaceUsers'
    }
}

export default setWorkspaceUsersHandler