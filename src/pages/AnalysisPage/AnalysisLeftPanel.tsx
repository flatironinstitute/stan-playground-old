import { FunctionComponent, useCallback, useEffect, useState } from "react";
import useRoute from "../../useRoute";
import AnalysisFileBrowser from "./AnalysisFileBrowser/AnalysisFileBrowser";
import { useAnalysis } from "./AnalysisPageContext";
import BackButton from "./BackButton";

type Props = {
    width: number
    height: number
}

const AnalysisLeftPanel: FunctionComponent<Props> = ({width, height}) => {
    const {analysisId, workspaceId, openTab, deleteAnalysis, analysisFiles} = useAnalysis()
    const {setRoute} = useRoute()
    const handleOpenFile = useCallback((fileName: string) => {
        openTab(`file:${fileName}`)
    }, [openTab])

    const handleDeleteAnalysis = useCallback(async () => {
        const okay = await confirm('Are you sure you want to delete this analysis?')
        if (!okay) return
        await deleteAnalysis()
        setRoute({page: 'workspace', workspaceId})
    }, [deleteAnalysis, setRoute, workspaceId])

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (!analysisFiles) return
        if (initialized) return
        const stanFiles = analysisFiles.filter(f => f.fileName.endsWith('.stan'))
        if (stanFiles.length === 1) {
            openTab(`file:${stanFiles[0].fileName}`)
        }
        setInitialized(true)
    }, [analysisFiles, openTab, initialized])

    const topHeight = 60
    const bottomHeight = 60
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', width, height: topHeight}}>
                <BackButton />
                <div>Analysis: {analysisId}</div>
            </div>
            <div style={{position: 'absolute', width, top: topHeight, height: height - topHeight - bottomHeight}}>
                <AnalysisFileBrowser
                    onOpenFile={handleOpenFile}
                />
            </div>
            <div style={{position: 'absolute', width, top: height - bottomHeight, height: bottomHeight}}>
                <button onClick={handleDeleteAnalysis}>Delete analysis</button>
            </div>
        </div>
    )
}

export default AnalysisLeftPanel