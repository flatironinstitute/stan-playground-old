import { GetWorkspacesRequest, GetWorkspacesResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace, SPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getWorkspacesHandler = async (request: GetWorkspacesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetWorkspacesResponse> => {
    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    
    const workspaces = removeIdField(await workspacesCollection.find({}).toArray())
    const workspaces2: SPWorkspace[] = []
    for (const workspace of workspaces) {
        if (!isSPWorkspace(workspace)) {
            console.warn(workspace)

            // // during development only, one-off deletion
            // await workspacesCollection.deleteOne({workspaceId: workspace.workspaceId})

            throw new Error('Invalid workspace in database (1)')
        }
        if (userCanReadWorkspace(workspace, o.verifiedUserId, o.verifiedClientId)) {
            workspaces2.push(workspace)
        }
    }
    return {
        type: 'getWorkspaces',
        workspaces: workspaces2
    }
}

export default getWorkspacesHandler