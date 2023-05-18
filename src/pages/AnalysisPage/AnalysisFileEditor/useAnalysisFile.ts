import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchAnalysisFile, fetchDataBlob, setAnalysisFileContent } from "../../../dbInterface/dbInterface"
import { useGithubAuth } from "../../../GithubAuth/useGithubAuth"

const useAnalysisFile = (workspaceId: string, analysisId: string, fileName: string) => {
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const [fileContent, setFileContent] = useState<string | undefined>(undefined)

    const {accessToken} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken} : undefined), [accessToken])

    useEffect(() => {
        let canceled = false
        setFileContent(undefined)
        ;(async () => {
            const af = await fetchAnalysisFile(analysisId, fileName)
            if (canceled) return
            if (!af) return
            const x = await fetchDataBlob(af.workspaceId, af.contentSha1)
            setFileContent(x)
        })()
        return () => {
            canceled = true
        }
    }, [analysisId, fileName, refreshCode])

    const setFileContentHandler = useCallback(async (fileContent: string) => {
        if (!workspaceId) {
            console.warn('No workspace ID')
            return
        }
        if (!auth) {
            console.warn('No auth')
            return
        }
        await setAnalysisFileContent(workspaceId, analysisId, fileName, fileContent, auth)
        setRefreshCode(rc => rc + 1)
    }, [workspaceId, analysisId, fileName, auth])

    return {
        fileContent,
        setFileContent: setFileContentHandler
    }
}

export default useAnalysisFile