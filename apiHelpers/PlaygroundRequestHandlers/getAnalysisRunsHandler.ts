import { GetAnalysisRunsRequest, GetAnalysisRunsResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis, isSPAnalysisRun, isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysisRunsHandler = async (request: GetAnalysisRunsRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisRunsResponse> => {
    const client = await getMongoClient()
    const analysisRunsCollection = client.db('stan-playground').collection('analysisRuns')

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId: request.analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (!isSPAnalysis(analysis)) {
        console.warn(analysis)
        throw new Error('Invalid analysis in database')
    }
    
    const workspaceId = analysis.workspaceId
    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId}))
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