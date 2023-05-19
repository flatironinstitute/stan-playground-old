import { GetWorkspacesRequest, GetWorkspacesResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getWorkspacesHandler = async (request: GetWorkspacesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetWorkspacesResponse> => {
    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    
    const workspaces = removeIdField(await workspacesCollection.find({}).toArray())
    for (const workspace of workspaces) {
        if (!isSPWorkspace(workspace)) {
            console.warn(workspace)

            // // during development only, one-off correction:
            // workspace.publiclyViewable = true
            // workspace.publiclyEditable = false
            // workspace.users = []
            // await workspacesCollection.updateOne({workspaceId: workspace.workspaceId}, {$set: workspace})

            throw new Error('Invalid workspace in database (1)')
        }
    }
    return {
        type: 'getWorkspaces',
        workspaces
    }
}

export default getWorkspacesHandler