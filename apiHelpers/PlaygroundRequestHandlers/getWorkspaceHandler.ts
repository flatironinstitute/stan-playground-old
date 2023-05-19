import { GetWorkspaceRequest, GetWorkspaceResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getWorkspaceHandler = async (request: GetWorkspaceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetWorkspaceResponse> => {
    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: request.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }

    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database (3)')
    }
    return {
        type: 'getWorkspace',
        workspace
    }
}

export default getWorkspaceHandler