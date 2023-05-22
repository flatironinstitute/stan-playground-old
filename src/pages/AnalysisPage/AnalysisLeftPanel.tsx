import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import Hyperlink from "../../components/Hyperlink";
import { prompt } from "../../confirm_prompt_alert";
import useRoute from "../../useRoute";
import { useWorkspace } from "../WorkspacePage/WorkspacePageContext";
import AnalysisFileBrowser from "./AnalysisFileBrowser/AnalysisFileBrowser";
import { useAnalysis } from "./AnalysisPageContext";
import BackButton from "./BackButton";

type Props = {
    width: number
    height: number
}

const AnalysisLeftPanel: FunctionComponent<Props> = ({width, height}) => {
    const {analysisId, analysis, workspaceId, openTab, deleteAnalysis, analysisFiles, setAnalysisProperty} = useAnalysis()
    const {workspace} = useWorkspace()
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

    const handleEditAnalysisName = useCallback(async () => {
        const newName = await prompt('Enter new analysis name:', analysis?.name || '')
        if (!newName) return
        if (!analysis) return
        setAnalysisProperty('name', newName)
    }, [analysis, setAnalysisProperty])

    const topHeight = 100
    const bottomHeight = 60
    const padding = 10
    const W = width - 2 * padding
    const H = height - 2 * padding
    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: W, height: H}}>
            <div style={{position: 'absolute', width: W, height: topHeight}}>
                <BackButton />
                <div style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    Analysis: {analysis?.name} <IconButton onClick={handleEditAnalysisName}><Edit fontSize="small" /></IconButton>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td>ID:</td>
                            <td>{analysisId}</td>
                        </tr>
                        <tr>
                            <td>Workspace:</td>
                            <td><Hyperlink onClick={() => {setRoute({page: 'workspace', workspaceId})}}>{workspace?.name}</Hyperlink></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{position: 'absolute', width: W, top: topHeight, height: H - topHeight - bottomHeight}}>
                <AnalysisFileBrowser
                    onOpenFile={handleOpenFile}
                />
            </div>
            <div style={{position: 'absolute', width: W, top: H - bottomHeight, height: bottomHeight}}>
                <button onClick={handleDeleteAnalysis}>Delete analysis</button>
            </div>
        </div>
    )
}

export default AnalysisLeftPanel