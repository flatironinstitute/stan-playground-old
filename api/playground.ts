import { VercelRequest, VercelResponse } from '@vercel/node'
import githubVerifyAccessToken from '../apiHelpers/githubVerifyAccessToken'
import JSONStringifyDeterminsitic from '../apiHelpers/jsonStringifyDeterministic'
import createProjectHandler from '../apiHelpers/PlaygroundRequestHandlers/createProjectHandler'
import createScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/createScriptJobHandler'
import createWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/createWorkspaceHandler'
import deleteCompletedScriptJobsHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteCompletedScriptJobsHandler'
import deleteComputeResourceHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteComputeResourceHandler'
import deleteProjectFileHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteProjectFileHandler'
import deleteProjectHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteProjectHandler'
import deleteScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteScriptJobHandler'
import deleteWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/deleteWorkspaceHandler'
import duplicateProjectFileHandler from '../apiHelpers/PlaygroundRequestHandlers/duplicateProjectFileHandler'
import renameProjectFileHandler from '../apiHelpers/PlaygroundRequestHandlers/renameProjectFileHandler'
import getComputeResourcesHandler from '../apiHelpers/PlaygroundRequestHandlers/getComputeResourcesHandler'
import getDataBlobHandler from '../apiHelpers/PlaygroundRequestHandlers/getDataBlobHandler'
import getPendingScriptJobsHandler from '../apiHelpers/PlaygroundRequestHandlers/getPendingScriptJobsHandler'
import getProjectFileHandler from '../apiHelpers/PlaygroundRequestHandlers/getProjectFileHandler'
import getProjectFilesHandler from '../apiHelpers/PlaygroundRequestHandlers/getProjectFilesHandler'
import getProjectHandler from '../apiHelpers/PlaygroundRequestHandlers/getProjectHandler'
import getProjectsHandler from '../apiHelpers/PlaygroundRequestHandlers/getProjectsHandler'
import getScriptJobHandler from '../apiHelpers/PlaygroundRequestHandlers/getScriptJobHandler'
import getScriptJobsHandler from '../apiHelpers/PlaygroundRequestHandlers/getScriptJobsHandler'
import getWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspaceHandler'
import getWorkspacesHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspacesHandler'
import registerComputeResourceHandler from '../apiHelpers/PlaygroundRequestHandlers/registerComputeResourceHandler'
import setProjectFileHandler from '../apiHelpers/PlaygroundRequestHandlers/setProjectFileHandler'
import setProjectPropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setProjectPropertyHandler'
import setScriptJobPropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setScriptJobPropertyHandler'
import setWorkspacePropertyHandler from '../apiHelpers/PlaygroundRequestHandlers/setWorkspacePropertyHandler'
import setWorkspaceUsersHandler from '../apiHelpers/PlaygroundRequestHandlers/setWorkspaceUsersHandler'
import verifySignature from '../apiHelpers/verifySignature'
import { isCreateProjectRequest, isCreateScriptJobRequest, isCreateWorkspaceRequest, isDeleteCompletedScriptJobsRequest, isDeleteComputeResourceRequest, isDeleteProjectFileRequest, isDeleteProjectRequest, isDeleteScriptJobRequest, isDeleteWorkspaceRequest, isDuplicateProjectFileRequest, isGetComputeResourcesRequest, isGetDataBlobRequest, isGetPendingScriptJobsRequest, isGetProjectFileRequest, isGetProjectFilesRequest, isGetProjectRequest, isGetProjectsRequest, isGetScriptJobRequest, isGetScriptJobsRequest, isGetWorkspaceRequest, isGetWorkspacesRequest, isPlaygroundRequest, isRegisterComputeResourceRequest, isRenameProjectFileRequest, isSetProjectFileRequest, isSetProjectPropertyRequest, isSetScriptJobPropertyRequest, isSetWorkspacePropertyRequest, isSetWorkspaceUsersRequest } from '../src/types/PlaygroundRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: request} = req

    // CORS ///////////////////////////////////
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if ([
        'http://localhost:3000',
        'http://localhost:5173',
        'https://flatironinstitute.github.io', // this is important for mcmc monitor
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
        else if (isGetProjectsRequest(payload)) {
            return await getProjectsHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetProjectRequest(payload)) {
            return await getProjectHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateProjectRequest(payload)) {
            return await createProjectHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteWorkspaceRequest(payload)) {
            return await deleteWorkspaceHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetProjectFilesRequest(payload)) {
            return await getProjectFilesHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetProjectFileRequest(payload)) {
            return await setProjectFileHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isGetProjectFileRequest(payload)) {
            return await getProjectFileHandler(payload, {verifiedClientId, verifiedUserId})
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
        else if (isDeleteProjectRequest(payload)) {
            return await deleteProjectHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetProjectPropertyRequest(payload)) {
            return await setProjectPropertyHandler(payload, {verifiedClientId, verifiedUserId})
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
        else if (isGetPendingScriptJobsRequest(payload)) {
            return await getPendingScriptJobsHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isSetScriptJobPropertyRequest(payload)) {
            return await setScriptJobPropertyHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDeleteProjectFileRequest(payload)) {
            return await deleteProjectFileHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isDuplicateProjectFileRequest(payload)) {
            return await duplicateProjectFileHandler(payload, {verifiedClientId, verifiedUserId})
        }
        else if (isRenameProjectFileRequest(payload)) {
            return await renameProjectFileHandler(payload, {verifiedClientId, verifiedUserId})
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