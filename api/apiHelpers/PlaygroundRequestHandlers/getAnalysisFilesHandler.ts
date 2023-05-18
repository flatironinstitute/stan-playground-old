import { GetAnalysisFilesRequest, GetAnalysisFilesResponse } from "../types/PlaygroundRequest";
import { isSPAnalysisFile } from "../types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getAnalysisFilesHandler = async (request: GetAnalysisFilesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisFilesResponse> => {
    const client = await getMongoClient()
    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')
    
    const analysisFiles = removeIdField(await analysisFilesCollection.find({
        analysisId: request.analysisId
    }).toArray())
    for (const analysisFile of analysisFiles) {
        if (!isSPAnalysisFile(analysisFile)) {
            console.warn(analysisFile)
            throw new Error('Invalid analysis file in database')
        }
    }
    return {
        type: 'getAnalysisFiles',
        analysisFiles
    }
}

export default getAnalysisFilesHandler