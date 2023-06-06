import { signMessage } from "./signatures";
import { isPlaygroundResponse, PlaygroundRequest, PlaygroundRequestPayload, PlaygroundResponse } from "./types/PlaygroundRequest";

const postPlaygroundRequestFromComputeResource = async (req: PlaygroundRequestPayload, o: {computeResourceId: string, computeResourcePrivateKey: string}): Promise<PlaygroundResponse | undefined> => {
    const rr: PlaygroundRequest = {
        payload: req,
        fromClientId: o.computeResourceId,
        signature: await signMessage(req, o.computeResourceId, o.computeResourcePrivateKey)
    }

    const stanPlaygroundUrl = process.env.STAN_PLAYGROUND_URL || 'https://stan-playground.vercel.app'
    // const stanPlaygroundUrl = process.env.STAN_PLAYGROUND_URL || 'http://localhost:3000'

    try {
        const resp = await fetch(`${stanPlaygroundUrl}/api/playground`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(rr),
        })
        const responseText = await resp.text()
        let responseData: any
        try {
            responseData = JSON.parse(responseText)
        }
        catch (err) {
            console.warn(responseText)
            throw Error('Unable to parse playground response')
        }
        if (!isPlaygroundResponse(responseData)) {
            console.warn(JSON.stringify(responseData, null, 2))
            throw Error('Unexpected playground response')
        }
        return responseData
    }
    catch (err) {
        console.warn(err)
        console.info(`Unable to post playground request: ${err.message}`)
        return undefined
    }
}

export default postPlaygroundRequestFromComputeResource