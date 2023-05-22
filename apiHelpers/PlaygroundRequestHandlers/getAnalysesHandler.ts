import { GetAnalysesRequest, GetAnalysesResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis, isSPWorkspace } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import { userCanReadWorkspace } from "../permissions";
import removeIdField from "../removeIdField";

const getAnalysesHandler = async (request: GetAnalysesRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysesResponse> => {
    const client = await getMongoClient()
    const analysesCollection = client.db('stan-playground').collection('analyses')

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({workspaceId: request.workspaceId}))
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