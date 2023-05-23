import { SetAnalysisPropertyRequest, SetAnalysisPropertyResponse } from "../../src/types/PlaygroundRequest";
import getAnalysis, { invalidateAnalysisCache } from '../getAnalysis';
import { getMongoClient } from "../getMongoClient";
import getWorkspace from '../getWorkspace';
import { userCanSetAnalysisProperty } from "../permissions";

const setAnalysisPropertyHandler = async (request: SetAnalysisPropertyRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<SetAnalysisPropertyResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis file')
    }

    const analysisId = request.analysisId

    const client = await getMongoClient()

    const analysis = await getAnalysis(analysisId, {useCache: false})

    const workspace = await getWorkspace(analysis.workspaceId, {useCache: true})
    if (!userCanSetAnalysisProperty(workspace, verifiedUserId, request.property)) {
        throw new Error('User does not have permission to set an analysis property in this workspace')
    }

    if (request.property === 'name') {
        analysis.name = request.value
    }
    else {
        throw new Error('Invalid property')
    }

    analysis.timestampModified = Date.now() / 1000

    const analysesCollection = client.db('stan-playground').collection('analyses')
    await analysesCollection.updateOne({analysisId}, {$set: analysis})

    invalidateAnalysisCache(analysisId)

    return {
        type: 'setAnalysisProperty'
    }
}

export default setAnalysisPropertyHandler