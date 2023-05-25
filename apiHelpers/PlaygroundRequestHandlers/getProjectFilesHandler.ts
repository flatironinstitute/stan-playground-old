import { GetProjectFilesRequest, GetProjectFilesResponse } from "../../src/types/PlaygroundRequest";
import { isSPProjectFile } from "../../src/types/stan-playground-types";
import getProject from "../getProject";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getProjectFilesHandler = async (request: GetProjectFilesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetProjectFilesResponse> => {
    const client = await getMongoClient()
    const projectFilesCollection = client.db('stan-playground').collection('projectFiles')

    const project = await getProject(request.projectId, {useCache: true})
    
    const workspaceId = project.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }

    const projectFiles = removeIdField(await projectFilesCollection.find({
        projectId: request.projectId
    }).toArray())
    for (const projectFile of projectFiles) {
        if (!isSPProjectFile(projectFile)) {
            console.warn(projectFile)

            // // during development only:
            // await projectFilesCollection.deleteOne({
            //     projectId: request.projectId,
            //     fileName: projectFile.fileName
            // })

            throw new Error('Invalid project file in database (3)')
        }
    }
    return {
        type: 'getProjectFiles',
        projectFiles
    }
}

export default getProjectFilesHandler