import { DeleteWorkspaceRequest, DeleteWorkspaceResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteWorkspace } from "../permissions";

const deleteWorkspaceHandler = async (request: DeleteWorkspaceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteWorkspaceResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to delete a workspace')
    }

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteWorkspace(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete this workspace')
    }

    const analysesCollection = client.db('stan-playground').collection('analyses')
    analysesCollection.deleteMany({workspaceId: request.workspaceId})

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    analysisFilesCollection.deleteMany({workspaceId: request.workspaceId})

    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')
    analysisRunsCollection.deleteMany({workspaceId: request.workspaceId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({workspaceId: request.workspaceId})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.deleteOne({workspaceId: request.workspaceId})

    return {
        type: 'deleteWorkspace'
    }
}

export default deleteWorkspaceHandler