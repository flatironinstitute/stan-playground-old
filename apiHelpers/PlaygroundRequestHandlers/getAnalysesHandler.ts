import { GetAnalysesRequest, GetAnalysesResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const getAnalysesHandler = async (request: GetAnalysesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysesResponse> => {
    const client = await getMongoClient()
    const analysesCollection = client.db('stan-playground').collection('analyses')
    
    const analyses = removeIdField(await analysesCollection.find({
        workspaceId: request.workspaceId
    }).toArray())
    for (const analysis of analyses) {
        if (!isSPAnalysis(analysis)) {
            console.warn(analysis)
            throw new Error('Invalid analysis in database')
        }
    }
    return {
        type: 'getAnalyses',
        analyses
    }
}

export default getAnalysesHandler