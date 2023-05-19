import { VercelRequest, VercelResponse } from '@vercel/node'
import githubVerifyAccessToken from '../apiHelpers/githubVerifyAccessToken'
import createAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/createAnalysisHandler'
import createAnalysisRunHandler from '../apiHelpers/PlaygroundRequestHandlers/createAnalysisRunHandler'
import deleteWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteWorkspaceHandler'
import createWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/createWorkspaceHandler'
import getAnalysesHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysesHandler'
import getAnalysisFileHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisFileHandler'
import getAnalysisFilesHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisFilesHandler'
import getAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisHandler'
import getAnalysisRunsHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisRunsHandler'
import getWorkspacesHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspacesHandler'
import setAnalysisFileHandler from '../apiHelpers/PlaygroundRequestHandlers/setAnalysisFileHandler'
import getDataBlobHandler from '../apiHelpers/PlaygroundRequestHandlers/getDataBlobHandler'
import deleteAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteAnalysisHandler'
import verifySignature from '../apiHelpers/verifySignature'
import {isSetAnalysisFileRequest, isCreateAnalysisRequest, isCreateWorkspaceRequest, isGetAnalysesRequest, isGetAnalysisFilesRequest, isGetAnalysisRequest, isGetWorkspacesRequest, isPlaygroundRequest, isGetAnalysisFileRequest, isGetAnalysisRunsRequest, isCreateAnalysisRunRequest, isGetDataBlobRequest, isDeleteWorkspaceRequest, isDeleteAnalysisRequest} from '../src/types/PlaygroundRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: request} = req

    // CORS ///////////////////////////////////
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if ([
        'http://localhost:3000',
        'http://localhost:5173',
        'https://flatironinstitute.github.io',
        'https://scratchrealm.github.io'
    ].includes(req.headers.origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    ///////////////////////////////////////////

    if (!isPlaygroundRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    const { payload, fromClientId, signature, userId, githubAccessToken } = request
    const { timestamp } = payload
    const elapsed = (Date.now() / 1000) - timestamp
    if ((elapsed > 30) || (elapsed < -30)) { 
        // Note the range used to be narrower, but was running into problems
        // For example, got elapsed = -0.662
        // Not sure the best way to do this check
        throw Error(`Invalid timestamp. ${timestamp} ${Date.now() / 1000} ${elapsed}`)
    }

    (async () => {
        let verifiedClientId: string | undefined = undefined
        if (fromClientId) {
            if (!signature) throw Error('No signature provided with fromClientId')
            if (!(await verifySignature(payload, fromClientId, signature))) {
                throw Error('Invalid signature')
            }
            verifiedClientId = fromClientId
        }

        let verifiedUserId: string | undefined = undefined
        if ((userId) && (userId.startsWith('github|')) && (githubAccessToken)) {
            if (!(await githubVerifyAccessToken(userId.slice('github|'.length), githubAccessToken))) {
                throw Error('Unable to verify github user ID')
            }
            verifiedUserId = userId
        }

        if (isGetWorkspacesRequest(payload)) {
            return await getWorkspacesHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateWorkspaceRequest(payload)) {
            return await createWorkspaceHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysesRequest(payload)) {
            return await getAnalysesHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysisRequest(payload)) {
            return await getAnalysisHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateAnalysisRequest(payload)) {
            return await createAnalysisHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteWorkspaceRequest(payload)) {
            return await deleteWorkspaceHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysisFilesRequest(payload)) {
            return await getAnalysisFilesHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetAnalysisFileRequest(payload)) {
            return await setAnalysisFileHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysisFileRequest(payload)) {
            return await getAnalysisFileHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysisRunsRequest(payload)) {
            return await getAnalysisRunsHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateAnalysisRunRequest(payload)) {
            return await createAnalysisRunHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetDataBlobRequest(payload)) {
            return await getDataBlobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteAnalysisRequest(payload)) {
            return await deleteAnalysisHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else {
            throw Error(`Unexpected request type: ${(payload as any).type}`)
        }
    })().then((response) => {
        res.json(response)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(500).send(`Error: ${error.message}`)
    })
}