import { DeleteWorkspaceRequest, DeleteWorkspaceResponse } from "../../src/types/PlaygroundRequest";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteWorkspace } from "../permissions";

const deleteWorkspaceHandler = async (request: DeleteWorkspaceRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteWorkspaceResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteWorkspace(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete this workspace')
    }

    const projectsCollection = client.db('stan-playground').collection('projects')
    projectsCollection.deleteMany({workspaceId: request.workspaceId})

    const projectFilesCollection = client.db('stan-playground').collection('projectFiles')
    projectFilesCollection.deleteMany({workspaceId: request.workspaceId})

    const projectRunsCollection = client.db('stan-playground').collection('projectRuns')
    projectRunsCollection.deleteMany({workspaceId: request.workspaceId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({workspaceId: request.workspaceId})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.deleteOne({workspaceId: request.workspaceId})

    return {
        type: 'deleteWorkspace'
    }
}

export default deleteWorkspaceHandler