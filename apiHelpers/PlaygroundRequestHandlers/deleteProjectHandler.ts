import { DeleteProjectRequest, DeleteProjectResponse } from "../../src/types/PlaygroundRequest";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanDeleteProject } from "../permissions";

const deleteProjectHandler = async (request: DeleteProjectRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteProjectResponse> => {
    const {verifiedUserId} = o

    const client = await getMongoClient()

    const workspace = await getWorkspace(request.workspaceId, {useCache: false})
    if (!userCanDeleteProject(workspace, verifiedUserId)) {
        throw new Error('User does not have permission to delete an projects in this workspace')
    }

    const project = await getProject(request.projectId, {useCache: false})
    if (project.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const projectsFilesCollection = client.db('stan-playground').collection('projectsFiles')
    projectsFilesCollection.deleteMany({projectId: request.projectId})

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    dataBlobsCollection.deleteMany({projectId: request.projectId})

    const scriptJobsCollection = client.db('stan-playground').collection('scriptJobs')
    scriptJobsCollection.deleteMany({projectId: request.projectId})

    const projectsCollection = client.db('stan-playground').collection('projects')

    await projectsCollection.deleteOne({projectId: request.projectId})

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    await workspacesCollection.updateOne({workspaceId: request.workspaceId}, {$set: {timestampModified: Date.now() / 1000}})

    return {
        type: 'deleteProject'
    }
}

export default deleteProjectHandler