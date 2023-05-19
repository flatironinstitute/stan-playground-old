import { GetAnalysisRequest, GetAnalysisResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getAnalysisHandler = async (request: GetAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisResponse> => {
    const client = await getMongoClient()
    const analysesCollection = client.db('stan-playground').collection('analyses')
    
    const analysis = removeIdField(await analysesCollection.findOne({
        analysisId: request.analysisId
    }))
    if (!analysis) {
        throw Error('Analysis not found')
    }
    if (!isSPAnalysis(analysis)) {
        console.warn(analysis)
        throw new Error('Invalid analysis in database')
    }
    return {
        type: 'getAnalysis',
        analysis
    }
}

export default getAnalysisHandler