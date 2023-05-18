import { GetWorkspacesRequest, GetWorkspacesResponse } from "../types/PlaygroundRequest";
import { isSPWorkspace } from "../types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getWorkspacesHandler = async (request: GetWorkspacesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetWorkspacesResponse> => {
    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    
    const workspaces = removeIdField(await workspacesCollection.find({}).toArray())
    for (const workspace of workspaces) {
        if (!isSPWorkspace(workspace)) {
            console.warn(workspace)
            throw new Error('Invalid workspace in database')
        }
    }
    return {
        type: 'getWorkspaces',
        workspaces
    }
}

export default getWorkspacesHandler