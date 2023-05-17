import { VercelRequest, VercelResponse } from '@vercel/node'
import githubVerifyAccessToken from '../apiHelpers/githubVerifyAccessToken'
import createAnalysisHandler from '../apiHelpers/PlaygroundRequestHandlers/createAnalysisHandler'
import createWorkspaceHandler from '../apiHelpers/PlaygroundRequestHandlers/createWorkspaceHandler'
import getAnalysesHandler from '../apiHelpers/PlaygroundRequestHandlers/getAnalysesHandler'
import getWorkspacesHandler from '../apiHelpers/PlaygroundRequestHandlers/getWorkspacesHandler'
import verifySignature from '../apiHelpers/verifySignature'
import {isCreateAnalysisRequest, isCreateWorkspaceRequest, isGetAnalysesRequest, isGetWorkspacesRequest, isPlaygroundRequest} from '../src/types/PlaygroundRequest'

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

    const { payload, fromClientId, signature, githubUserId, githubAccessToken } = request
    const { timestamp } = payload
    const elapsed = Date.now() - timestamp
    if ((elapsed > 30000) || (elapsed < -30000)) { 
        // Note the range used to be narrower, but was running into problems
        // For example, got elapsed = -662
        // Not sure the best way to do this check
        throw Error(`Invalid timestamp. ${timestamp} ${Date.now()} ${elapsed}`)
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
        if (githubUserId) {
            if (!(await githubVerifyAccessToken(githubUserId, githubAccessToken))) {
                throw Error('Unable to verify github user ID')
            }
            verifiedUserId = githubUserId
        }

        if (isGetWorkspacesRequest(request)) {
            return await getWorkspacesHandler(request, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateWorkspaceRequest(request)) {
            return await createWorkspaceHandler(request, {verifiedClientId, verifiedUserId})
        }
        else if (isGetAnalysesRequest(request)) {
            return await getAnalysesHandler(request, {verifiedClientId, verifiedUserId})
        }
        else if (isCreateAnalysisRequest(request)) {
            return await createAnalysisHandler(request, {verifiedClientId, verifiedUserId})
        }
        else {
            throw Error(`Unexpected request type: ${(request as any).payload.type}`)
        }
    })().then((response) => {
        res.json(response)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(500).send(`Error: ${error.message}`)
    })
}