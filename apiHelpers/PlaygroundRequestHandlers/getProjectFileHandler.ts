import { GetProjectFileRequest, GetProjectFileResponse } from "../../src/types/PlaygroundRequest";
import { isSPProjectFile } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getProjectFileHandler = async (request: GetProjectFileRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetProjectFileResponse> => {
    const client = await getMongoClient()
    const projectFilesCollection = client.db('stan-playground').collection('projectFiles')
    
    const projectFile = removeIdField(await projectFilesCollection.findOne({
        projectId: request.projectId,
        fileName: request.fileName
    }))
    if (!projectFile) {
        throw Error('Project file not found')
    }
    if (!isSPProjectFile(projectFile)) {
        console.warn(projectFile)
        throw new Error('Invalid project file in database (2)')
    }

    // For now we allow anonymous users to read project files because this is needed for the MCMC Monitor to work
    // const workspace = await getWorkspace(projectFile.workspaceId, {useCache: true})
    // if (!userCanReadWorkspace(workspace, o.verifiedUserId, o.verifiedClientId)) {
    //     throw new Error('User does not have permission to read this workspace')
    // }

    return {
        type: 'getProjectFile',
        projectFile
    }
}

export default getProjectFileHandler