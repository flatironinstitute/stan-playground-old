import { GetAnalysisFileRequest, GetAnalysisFileResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisFile, isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysisFileHandler = async (request: GetAnalysisFileRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisFileResponse> => {
    const client = await getMongoClient()
    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    
    const analysisFile = removeIdField(await analysisFilesCollection.findOne({
        analysisId: request.analysisId,
        fileName: request.fileName
    }))
    if (!analysisFile) {
        throw Error('Analysis file not found')
    }
    if (!isSPAnalysisFile(analysisFile)) {
        console.warn(analysisFile)
        throw new Error('Invalid analysis file in database (2)')
    }

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: analysisFile.workspaceId}))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database')
    }
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }

    return {
        type: 'getAnalysisFile',
        analysisFile
    }
}

export default getAnalysisFileHandler