import { GetWorkspacesRequest, GetWorkspacesResponse } from "../../src/types/PlaygroundRequest";
import { isSPWorkspace, SPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getWorkspacesHandler = async (request: GetWorkspacesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetWorkspacesResponse> => {
    const client = await getMongoClient()
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const userId = o.verifiedUserId
    
    const workspaces = removeIdField(await workspacesCollection.find({}).toArray())
    const workspaces2: SPWorkspace[] = []
    for (const workspace of workspaces) {
        if (!isSPWorkspace(workspace)) {
            console.warn(workspace)

            // // one-off fix
            // const workspace2 = {
            //     workspaceId: workspace.workspaceId,
            //     ownerId: workspace.ownerId,
            //     name: workspace.name,
            //     description: workspace.description,
            //     users: workspace.users,
            //     publiclyReadable: true,
            //     listed: true,
            //     timestampCreated: workspace.timestampCreated,
            //     timestampModified: workspace.timestampModified,
            //     computeResourceId: workspace.computeResourceId
            // }
            // await workspacesCollection.deleteOne({workspaceId: workspace.workspaceId})
            // await workspacesCollection.insertOne(workspace2)

            throw new Error('Invalid workspace in database (1)')
        }
        let okay = false
        if ((userId) && (workspace.ownerId === userId)) {
            okay = true
        }
        if (userId && (workspace.users.map(u => u.userId).includes(userId))) {
            okay = true
        }
        if (workspace.listed) {
            okay = true
        }
        if (okay) {
            workspaces2.push(workspace)
        }
    }
    return {
        type: 'getWorkspaces',
        workspaces: workspaces2
    }
}

export default getWorkspacesHandler