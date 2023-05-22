import { GetAnalysisRequest, GetAnalysisResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis, isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
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

    return {
        type: 'getAnalysis',
        analysis
    }
}

export default getAnalysisHandler