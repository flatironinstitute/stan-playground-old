import { VercelRequest, VercelResponse } from '@vercel/node'
import githubVerifyAccessToken from '../apiHelpers/githubVerifyAccessToken'
import JSONStringifyDeterminsitic from '../apiHelpers/jsonStringifyDeterministic'
import createAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/createAnalysisHandler'
import createAnalysisRunHandler from '../apiHelpers/PlaygroundRequestHandlers/createAnalysisRunHandler'
import createScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/createScriptJobHandler'
import createWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/createWorkspaceHandler'
import deleteAnalysisFileHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteAnalysisFileHandler'
import deleteAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteAnalysisHandler'
import deleteCompletedScriptJobsHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteCompletedScriptJobsHandler'
import deleteComputeResourceHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteComputeResourceHandler'
import deleteScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteScriptJobHandler'
import deleteWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteWorkspaceHandler'
import getAnalysesHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysesHandler'
import getAnalysisFileHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisFileHandler'
import getAnalysisFilesHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisFilesHandler'
import getAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisHandler'
import getAnalysisRunsHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysisRunsHandler'
import getComputeResourcesHandler from '../apiHelpers/PlaygroundRequestHandlers/getComputeResourcesHandler'
import getDataBlobHandler from '../apiHelpers/PlaygroundRequestHandlers/getDataBlobHandler'
import getPendingScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/getPendingScriptJobHandler'
import getScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/getScriptJobHandler'
import getScriptJobsHandler from '../apiHelpers/PlaygroundRequestHandlers/getScriptJobsHandler'
import getWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspaceHandler'
import getWorkspacesHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspacesHandler'
import registerComputeResourceHandler from '../apiHelpers/PlaygroundRequestHandlers/registerComputeResourceHandler'
import setAnalysisFileHandler from '../apiHelpers/PlaygroundRequestHandlers/setAnalysisFileHandler'
import setAnalysisPropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setAnalysisPropertyHandler'
import setScriptJobPropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setScriptJobPropertyHandler'
import setWorkspacePropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setWorkspacePropertyHandler'
import setWorkspaceUsersHandler from '../apiHelpers/PlaygroundRequestHandlers/setWorkspaceUsersHandler'
import verifySignature from '../apiHelpers/verifySignature'
import { isCreateAnalysisRequest, isCreateAnalysisRunRequest, isCreateScriptJobRequest, isCreateWorkspaceRequest, isDeleteAnalysisFileRequest, isDeleteAnalysisRequest, isDeleteCompletedScriptJobsRequest, isDeleteComputeResourceRequest, isDeleteScriptJobRequest, isDeleteWorkspaceRequest, isGetAnalysesRequest, isGetAnalysisFileRequest, isGetAnalysisFilesRequest, isGetAnalysisRequest, isGetAnalysisRunsRequest, isGetComputeResourcesRequest, isGetDataBlobRequest, isGetPendingScriptJobRequest, isGetScriptJobRequest, isGetScriptJobsRequest, isGetWorkspaceRequest, isGetWorkspacesRequest, isPlaygroundRequest, isRegisterComputeResourceRequest, isSetAnalysisFileRequest, isSetAnalysisPropertyRequest, isSetScriptJobPropertyRequest, isSetWorkspacePropertyRequest, isSetWorkspaceUsersRequest } from '../src/types/PlaygroundRequest'

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
            if (!(await verifySignature(JSONStringifyDeterminsitic(payload), fromClientId, signature))) {
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
        else if (isGetWorkspaceRequest(payload)) {
            return await getWorkspaceHandler(payload, {verifiedClientId, verifiedUserId})
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
        else if (isSetWorkspaceUsersRequest(payload)) {
            return await setWorkspaceUsersHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetWorkspacePropertyRequest(payload)) {
            return await setWorkspacePropertyHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetDataBlobRequest(payload)) {
            return await getDataBlobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteAnalysisRequest(payload)) {
            return await deleteAnalysisHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetAnalysisPropertyRequest(payload)) {
            return await setAnalysisPropertyHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetComputeResourcesRequest(payload)) {
            return await getComputeResourcesHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isRegisterComputeResourceRequest(payload)) {
            return await registerComputeResourceHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteComputeResourceRequest(payload)) {
            return await deleteComputeResourceHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateScriptJobRequest(payload)) {
            return await createScriptJobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetScriptJobsRequest(payload)) {
            return await getScriptJobsHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteScriptJobRequest(payload)) {
            return await deleteScriptJobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteCompletedScriptJobsRequest(payload)) {
            return await deleteCompletedScriptJobsHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetScriptJobRequest(payload)) {
            return await getScriptJobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetPendingScriptJobRequest(payload)) {
            return await getPendingScriptJobHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetScriptJobPropertyRequest(payload)) {
            return await setScriptJobPropertyHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteAnalysisFileRequest(payload)) {
            return await deleteAnalysisFileHandler(payload, {verifiedClientId, verifiedUserId})
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