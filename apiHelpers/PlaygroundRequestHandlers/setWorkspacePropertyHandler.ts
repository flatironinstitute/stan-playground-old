import { SetWorkspacePropertyRequest, SetWorkspacePropertyResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanSetWorkspaceProperty } from "../permissions";
import removeIdField from "../removeIdField";

const setWorkspacePropertyHandler = async (request: SetWorkspacePropertyRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<SetWorkspacePropertyResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to set workspace properties')
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
        throw new Error('Invalid workspace in database (***)')
    }
    if (userCanSetWorkspaceProperty(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to set workspace properties')
    }

    if (request.property === 'anonymousUserRole') {
        workspace.anonymousUserRole = request.value
    }
    else if (request.property === 'loggedInUserRole') {
        workspace.loggedInUserRole = request.value
    }
    else {
        throw new Error('Invalid property')
    }

    await workspacesCollection.updateOne({workspaceId}, {$set: workspace})

    return {
        type: 'setWorkspaceProperty'
    }
}

export default setWorkspacePropertyHandler