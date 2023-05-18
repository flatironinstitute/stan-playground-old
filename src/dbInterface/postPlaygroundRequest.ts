import { isPlaygroundResponse, PlaygroundRequest, PlaygroundRequestPayload, PlaygroundResponse } from "../types/PlaygroundRequest";

const postPlaygroundRequest = async (req: PlaygroundRequestPayload, o: {githubAccessToken?: string}): Promise<PlaygroundResponse> => {
    const rr: PlaygroundRequest = {
        payload: req
    }
    if (o.githubAccessToken) {
        rr.githubAccessToken = o.githubAccessToken
    }
    const resp = await fetch('/api/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rr),
    })
    const responseData = await resp.json()
    if (!isPlaygroundResponse(responseData)) {
        console.warn(responseData)
        throw Error('Unexpected playground response')
    }
    return responseData
}

export default postPlaygroundRequest