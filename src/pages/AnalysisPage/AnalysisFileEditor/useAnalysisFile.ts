import { useCallback, useEffect, useState } from "react"
import { fetchAnalysisFile, fetchDataBlob, setAnalysisFileContent } from "../../../dbInterface/dbInterface"

const useAnalysisFile = (analysisId: string, fileName: string) => {
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const [fileContent, setFileContent] = useState<string | undefined>(undefined)

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
        await setAnalysisFileContent(analysisId, fileName, fileContent)
        setRefreshCode(rc => rc + 1)
    }, [analysisId, fileName])

    return {
        fileContent,
        setFileContent: setFileContentHandler
    }
}

export default useAnalysisFile