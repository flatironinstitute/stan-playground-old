import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import ComputeResourceIdComponent from "../../../ComputeResourceIdComponent";
import { fetchScriptJob } from "../../../dbInterface/dbInterface";
import { useGithubAuth } from "../../../GithubAuth/useGithubAuth";
import { GetScriptJobRequest } from "../../../types/PlaygroundRequest";
import { SPScriptJob } from "../../../types/stan-playground-types";
import { useAnalysis } from "../AnalysisPageContext";

type Props = {
    width: number,
    height: number,
    scriptJobId: string
}

const useScriptJob = (workspaceId: string, analysisId: string, scriptJobId: string) => {
    const [scriptJob, setScriptJob] = useState<SPScriptJob | undefined>()

    const [refreshCode, setRefreshCode] = useState(0)
    const refreshScriptJob = useCallback(() => {
        setRefreshCode(rc => rc + 1)
    }, [])

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    useEffect(() => {
        let canceled = false
        ;(async () => {
            setScriptJob(undefined)
            const scriptJob = await fetchScriptJob(workspaceId, analysisId, scriptJobId, auth)
            if (canceled) return
            setScriptJob(scriptJob)
        })()
        return () => {
            canceled = true
        }
    }, [workspaceId, analysisId, scriptJobId, auth, refreshCode])
    return {scriptJob, refreshScriptJob}
}

const ScriptJobView: FunctionComponent<Props> = ({ width, height, scriptJobId }) => {
    const {workspaceId, analysisId} = useAnalysis()
    const {scriptJob, refreshScriptJob} = useScriptJob(workspaceId, analysisId, scriptJobId)
    if (!scriptJob) {
        return (
            <p>Loading script job {scriptJobId}</p>
        )
    }
    return (
        <div style={{position: 'absolute', width, height, background: 'white'}}>
            <hr />
            <table>
                <tbody>
                    <tr>
                        <td>Script job ID:</td>
                        <td>{scriptJob.scriptJobId}</td>
                    </tr>
                    <tr>
                        <td>Script file name:</td>
                        <td>{scriptJob.scriptFileName}</td>
                    </tr>
                    <tr>
                        <td>Compute resource:</td>
                        <td><ComputeResourceIdComponent computeResourceId={scriptJob.computeResourceId} /></td>
                    </tr>
                    <tr>
                        <td>Job status:</td>
                        <td>{scriptJob.status}</td>
                    </tr>
                    <tr>
                        <td>Error:</td>
                        <td style={{color: 'red'}}>{scriptJob.error}</td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <button onClick={refreshScriptJob}>Refresh</button>
            <hr />
            <h3>Console output</h3>
            <pre>
                {scriptJob.consoleOutput}
            </pre>
        </div>
    )
}

export default ScriptJobView