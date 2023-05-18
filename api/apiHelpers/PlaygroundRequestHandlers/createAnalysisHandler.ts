import { CreateAnalysisRequest, CreateAnalysisResponse, SetAnalysisFileRequest } from "../types/PlaygroundRequest";
import { SPAnalysis } from "../types/stan-playground-types";
import createRandomId from "../createRandomId";
import { getMongoClient } from "../getMongoClient";
import setAnalysisFileHandler from "./setAnalysisFileHandler";

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

    const filesToAdd = [
        {
            fileName: 'main.stan',
            fileContent: defaultStanProgram
        },
        {
            fileName: 'data.json',
            fileContent: '{}'
        },
        {
            fileName: 'options.yaml',
            fileContent: defaultOptionsYaml
        }
    ]

    for (const x of filesToAdd) {
        const rr: SetAnalysisFileRequest = {
            type: 'setAnalysisFile',
            timestamp: Date.now() / 1000,
            analysisId,
            workspaceId,
            fileName: x.fileName,
            fileContent: x.fileContent
        }
        await setAnalysisFileHandler(rr, o)
    }

    return {
        type: 'createAnalysis',
        analysisId
    }
}

const defaultStanProgram = ``

const defaultOptionsYaml = ``

export default createAnalysisHandler