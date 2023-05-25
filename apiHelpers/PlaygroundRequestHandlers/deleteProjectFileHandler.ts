import { DeleteProjectFileRequest, DeleteProjectFileResponse } from "../../src/types/PlaygroundRequest";
import getProject from '../getProject';
import { getMongoClient } from "../getMongoClient";
import getWorkspace from '../getWorkspace';
import { userCanDeleteProjectFile } from "../permissions";

const deleteProjectFileHandler = async (request: DeleteProjectFileRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteProjectFileResponse> => {
    const {verifiedUserId, verifiedClientId} = o

    const projectId = request.projectId

    const client = await getMongoClient()

    const project = await getProject(projectId, {useCache: false})
    if (project.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const workspace = await getWorkspace(project.workspaceId, {useCache: true})
    if (!userCanDeleteProjectFile(workspace, verifiedUserId, verifiedClientId)) {
        throw new Error('User does not have permission to delete an projects file in this workspace')
    }

    const projectsFilesCollection = client.db('stan-playground').collection('projectsFiles')

    const projectsFile = await projectsFilesCollection.findOne({
        projectId,
        fileName: request.fileName
    })
    if (!projectsFile) {
        throw new Error('Project file does not exist')
    }

    await projectsFilesCollection.deleteOne({
        projectId,
        fileName: request.fileName
    })
    
    return {
        type: 'deleteProjectFile'
    }
}

export default deleteProjectFileHandler