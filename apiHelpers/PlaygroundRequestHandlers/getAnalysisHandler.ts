import { GetAnalysisRequest, GetAnalysisResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis from "../getAnalysis";
import getWorkspace from "../getWorkspace";
import { userCanReadWorkspace } from "../permissions";

const getAnalysisHandler = async (request: GetAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<GetAnalysisResponse> => {
    const analysis = await getAnalysis(request.analysisId, {useCache: false})

    const workspaceId = analysis.workspaceId
    const workspace = await getWorkspace(workspaceId, {useCache: true})
    if (!userCanReadWorkspace(workspace, o.verifiedUserId)) {
        throw new Error('User does not have permission to read this workspace')
    }

    return {
        type: 'getAnalysis',
        analysis
    }
}

export default getAnalysisHandler