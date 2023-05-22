import { GetAnalysisRunsRequest, GetAnalysisRunsResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysisRun } from "../../src/types/stan-playground-types";
import getAnalysis from "../getAnalysis";
import { getMongoClient } from "../getMongoClient";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysisRunsHandler = async (request: GetAnalysisRunsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisRunsResponse> => {
    const client = await getMongoClient()
    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')

    const analysis = await getAnalysis(request.analysisId, {useCache: true})
    
    const workspaceId = analysis.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }
    
    const analysisRuns = removeIdField(await analysisRunsCollection.find({
        analysisId: request.analysisId
    }).toArray())
    for (const analysisRun of analysisRuns) {
        if (!isSPAnalysisRun(analysisRun)) {
            console.warn(analysisRun)
            throw new Error('Invalid analysis run in database')
        }
    }
    return {
        type: 'getAnalysisRuns',
        analysisRuns
    }
}

export default getAnalysisRunsHandler