import { useCallback, useEffect, useState } from "react"
import { fetchAnalysisFile, setAnalysisFileContent } from "../../../dbInterface/dbInterface"

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
            setFileContent(af.fileContent)
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