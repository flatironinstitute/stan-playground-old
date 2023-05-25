import { DeleteProjectRunRequest, DeleteProjectRunResponse } from "../../src/types/PlaygroundRequest";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteProjectRun } from "../permissions";

const deleteProjectRunHandler = async (request: DeleteProjectRunRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteProjectRunResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteProjectRun(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete an project run in this workspace')
    }

    const project = await getProject(request.projectId, {useCache: false})
    // important to check this
    if (project.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const projectRunsCollection = client.db('stan-playground').collection('projectRuns')
    await projectRunsCollection.deleteOne({projectRunId: request.projectRunId})

    const projectsCollection = client.db('stan-playground').collection('projects')
    await projectsCollection.updateOne({projectId: request.projectId}, {$set: {timestampModified: Date.now() / 1000}})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'deleteProjectRun'
    }
}

export default deleteProjectRunHandler