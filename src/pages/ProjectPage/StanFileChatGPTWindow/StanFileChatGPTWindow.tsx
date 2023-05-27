import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useGithubAuth } from "../../../GithubAuth/useGithubAuth";
import { useProject } from "../ProjectPageContext";

type Props = {
    width: number
    height: number
    stanFileName: string
}

const initialPrompt = `Explain this model.`

const StanFileChatGPTWindow: FunctionComponent<Props> = ({width, height, stanFileName}) => {
    const {askAboutStanProgram} = useProject()
    const [prompt, setPrompt] = useState(initialPrompt)
    const [response, setResponse] = useState('')
    const [cumulativeTokensUsed, setCumulativeTokensUsed] = useState<number | undefined>(undefined)
    const [processing, setProcessing] = useState(false)

    const {userId} = useGithubAuth()

    useEffect(() => {
        let canceled = false
        ;(async () => {
            const cacheOnly = true
            const {response} = await askAboutStanProgram(stanFileName, initialPrompt, cacheOnly)
            if (canceled) return
            if (response) {
                setResponse(response)
            }
        })()
        return () => {canceled = true}
    }, [askAboutStanProgram, stanFileName])

    const handleSubmit = useCallback(async () => {
        if (processing) return
        setProcessing(true)
        try {
            const cacheOnly = false
            const {response, cumulativeTokensUsed} = await askAboutStanProgram(stanFileName, prompt, cacheOnly)
            setResponse(response)
            if (cumulativeTokensUsed) {
                setCumulativeTokensUsed(cumulativeTokensUsed)
            }
        }
        finally {
            setProcessing(false)
        }
    }, [askAboutStanProgram, stanFileName, prompt, processing])

    return (
        <div style={{width: width, height: height, backgroundColor: 'white'}}>
            <div style={{height: 30, backgroundColor: 'lightgray'}}>
                <div style={{padding: 5, fontWeight: 'bold'}}>Ask ChatGPT about this Stan program</div>
            </div>
            <div style={{height: height - 30, backgroundColor: 'white'}}>
                <div style={{padding: 5}}>
                    <div style={{padding: 5}}>
                        <div style={{fontWeight: 'bold'}}>Prompt</div>
                        <textarea
                            style={{width: '100%', height: 100}}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                        />
                    </div>

                    {
                        !userId && (
                            <div style={{padding: 5}}>
                                <div style={{fontWeight: 'bold', color: 'gray'}}>You must log in to use ChatGPT</div>
                            </div>
                        )
                    }

                    {/* Submit button */}
                    <div style={{padding: 5}}>
                        <button onClick={handleSubmit} disabled={!userId}>Submit</button>
                    </div>

                    <div style={{padding: 5}}>
                        <div style={{fontWeight: 'bold'}}>Response</div>
                        <div>
                            {
                                processing ? (
                                    <div>Processing...</div>
                                ) : (
                                    response
                                )
                            }
                        </div>
                    </div>

                    {
                        cumulativeTokensUsed !== undefined && (
                            <div style={{padding: 5, color: '#aaa'}}>
                                <div style={{fontWeight: 'bold'}}>Cumulative tokens used for {userId}</div>
                                <div>{(cumulativeTokensUsed / 1e3).toFixed(1)}k / 200k</div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default StanFileChatGPTWindow