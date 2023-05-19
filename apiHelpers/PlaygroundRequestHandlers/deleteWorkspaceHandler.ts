import { DeleteWorkspaceRequest, DeleteWorkspaceResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const deleteWorkspaceHandler = async (request: DeleteWorkspaceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteWorkspaceResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to delete a workspace')
    }

    const client = await getMongoClient()

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: request.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }

    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Only the owner of a workspace can delete the workspace')
    }

    const analysesCollection = client.db('stan-playground').collection('analyses')
    analysesCollection.deleteMany({workspaceId: request.workspaceId})

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    analysisFilesCollection.deleteMany({workspaceId: request.workspaceId})

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    analysisRunsCollection.deleteMany({workspaceId: request.workspaceId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({workspaceId: request.workspaceId})

    await workspacesCollection.deleteOne({workspaceId: request.workspaceId})

    return {
        type: 'deleteWorkspace'
    }
}

export default deleteWorkspaceHandler