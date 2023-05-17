import { CreateAnalysisRequest, CreateAnalysisResponse } from "../../src/types/PlaygroundRequest";
import { SPAnalysis, SPAnalysisFile } from "../../src/types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";

const createAnalysisHandler = async (request: CreateAnalysisRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<CreateAnalysisResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis')
    }

    const analysisId = createRandomId(8)

    const workspaceId = request.workspaceId

    const analysis: SPAnalysis = {
        analysisId,
        workspaceId,
        name: 'Untitled',
        description: '',
        timestampCreated: Date.now() / 1000,
        timestampModified: Date.now() / 1000
    }

    const client = await getMongoClient()
    const analysesCollection = client.db('stan-playground').collection('analyses')

    await analysesCollection.insertOne(analysis)

    const analysesFilesToAdd: SPAnalysisFile[] = [
        {
            analysisId,
            workspaceId,
            fileName: 'main.stan',
            fileContent: defaultStanProgram,
            timestampModified: Date.now() / 1000
        },
        {
            analysisId,
            workspaceId,
            fileName: 'data.json',
            fileContent: '{}',
            timestampModified: Date.now() / 1000
        },
        {
            analysisId,
            workspaceId,
            fileName: 'options.yaml',
            fileContent: defaultOptionsYaml,
            timestampModified: Date.now() / 1000
        }
    ]

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')

    for (const af of analysesFilesToAdd) {
        await analysisFilesCollection.insertOne(af)
    }

    return {
        type: 'createAnalysis',
        analysisId
    }
}

const defaultStanProgram = ``

const defaultOptionsYaml = ``

export default createAnalysisHandler