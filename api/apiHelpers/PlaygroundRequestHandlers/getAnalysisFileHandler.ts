import { GetAnalysisFileRequest, GetAnalysisFileResponse } from "../types/PlaygroundRequest";
import { isSPAnalysisFile } from "../types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
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
        throw new Error('Invalid analysis file in database')
    }
    return {
        type: 'getAnalysisFile',
        analysisFile
    }
}

export default getAnalysisFileHandler