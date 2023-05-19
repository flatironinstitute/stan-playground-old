import crypto from 'crypto';
import { SetAnalysisFileRequest, SetAnalysisFileResponse } from "../../src/types/PlaygroundRequest";
import { isSPAnalysis, isSPWorkspace, SPAnalysisFile } from "../../src/types/stan-playground-types";
import { getMongoClient } from "../getMongoClient";
import removeIdField from "../removeIdField";

const setAnalysisFileHandler = async (request: SetAnalysisFileRequest, o: {verifiedClientId?: string, verifiedUserId?: string}): Promise<SetAnalysisFileResponse> => {
    const {verifiedUserId} = o

    if (!verifiedUserId) {
        throw new Error('Must be logged in to create an analysis file')
    }

    const analysisId = request.analysisId

    const client = await getMongoClient()

    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({
        analysisId
    }))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (!isSPAnalysis(analysis)) {
        console.warn(analysis)
        throw new Error('Invalid analysis in database')
    }
    if (analysis.workspaceId !== request.workspaceId) {
        throw new Error('Incorrect workspace ID')
    }

    const workspaceId = analysis.workspaceId

    const workspacesCollection = client.db('stan-playground').collection('workspaces')
    const workspace = removeIdField(await workspacesCollection.findOne({
        workspaceId
    }))
    if (!workspace) {
        throw new Error('Workspace not found')
    }
    if (!isSPWorkspace(workspace)) {
        console.warn(workspace)
        throw new Error('Invalid workspace in database')
    }
    if (workspace.ownerId !== verifiedUserId) {
        throw new Error('Must be the owner of the workspace to set an analysis file')
    }

    const dataBlobsCollection = client.db('stan-playground').collection('dataBlobs')
    const contentSha1 = sha1OfString(request.fileContent)
    const contentSize = request.fileContent.length
    const dataBlob = await dataBlobsCollection.findOne({
        workspaceId,
        analysisId,
        sha1: contentSha1
    })
    if (!dataBlob) {
        await dataBlobsCollection.insertOne({
            workspaceId,
            analysisId,
            sha1: contentSha1,
            size: contentSize,
            content: request.fileContent
        })
    }

    const analysisFilesCollection = client.db('stan-playground').collection('analysisFiles')

    const analysisFile = await analysisFilesCollection.findOne({
        analysisId,
        fileName: request.fileName
    })
    if (!analysisFile) {
        const newAnalysisFile: SPAnalysisFile = {
            analysisId,
            workspaceId,
            fileName: request.fileName,
            contentSha1,
            contentSize,
            timestampModified: Date.now() / 1000
        }
        await analysisFilesCollection.insertOne(newAnalysisFile)
    }
    else {
        await analysisFilesCollection.updateOne({
            analysisId,
            fileName: request.fileName
        }, {
            $set: {
                contentSha1,
                contentSize,
                timestampModified: Date.now() / 1000
            }
        })
    }

    return {
        type: 'setAnalysisFile'
    }
}

const sha1OfString = (s: string): string => {
    const hash = crypto.createHash('sha1')
    hash.update(s)
    return hash.digest('hex')
}

export default setAnalysisFileHandler