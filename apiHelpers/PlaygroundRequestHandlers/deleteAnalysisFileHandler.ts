import { DeleteAnalysisFileRequest, DeleteAnalysisFileResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from '../getAnalysis';
import { getMongoClient } from "../getMongoClient";
import getWorkspace from '../getWorkspace';
import { userCanDeleteAnalysisFile } from "../permissions";

const deleteAnalysisFileHandler = async (request: DeleteAnalysisFileRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<DeleteAnalysisFileResponse> => {
    const {verifiedUserId, verifiedClientId} = o

    const analysisId = request.analysisId

    const client = await getMongoClient()

    const analysis = await getAnalysis(analysisId, {useCache: false})
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const workspace = await getWorkspace(analysis.workspaceId, {useCache: true})
    if (!userCanDeleteAnalysisFile(workspace, verifiedUserId, verifiedClientId)) {
        throw new Error('User does not have permission to delete an analysis file in this workspace')
    }

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')

    const analysisFile = await analysisFilesCollection.findOne({
        analysisId,
        fileName: request.fileName
    })
    if (!analysisFile) {
        throw new Error('Analysis file does not exist')
    }

    await analysisFilesCollection.deleteOne({
        analysisId,
        fileName: request.fileName
    })
    
    return {
        type: 'deleteAnalysisFile'
    }
}

export default deleteAnalysisFileHandler