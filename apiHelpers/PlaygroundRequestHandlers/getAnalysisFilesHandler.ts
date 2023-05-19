import { GetAnalysisFilesRequest, GetAnalysisFilesResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisFile } from "../../src/types/stan-playground-types";
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

            // // during development only:
            // await analysisFilesCollection.deleteOne({
            //     analysisId: request.analysisId,
            //     fileName: analysisFile.fileName
            // })

            throw new Error('Invalid analysis file in database (3)')
        }
    }
    return {
        type: 'getAnalysisFiles',
        analysisFiles
    }
}

export default getAnalysisFilesHandler