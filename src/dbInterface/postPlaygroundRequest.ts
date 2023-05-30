import { isPlaygroundResponse, PlaygroundRequest, PlaygroundRequestPayload, PlaygroundResponse } from "../types/PlaygroundRequest";

const postPlaygroundRequest = async (req: PlaygroundRequestPayload, o: {userId?: string, githubAccessToken?: string}): Promise<PlaygroundResponse> => {
    const rr: PlaygroundRequest = {
        payload: req
    }
    if ((o.userId) && (o.githubAccessToken)) {
        rr.githubAccessToken = o.githubAccessToken
        rr.userId = o.userId
    }
    const resp = await fetch('/api/playground', {
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
    } catch (e) {
        console.error(responseText)
        throw Error('Problem parsing playground response')
    }
    if (!isPlaygroundResponse(responseData)) {
        console.warn(responseData)
        throw Error('Unexpected playground response')
    }
    return responseData
}

export default postPlaygroundRequest