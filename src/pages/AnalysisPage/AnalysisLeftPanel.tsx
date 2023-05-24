import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import { useModalDialog } from "../../ApplicationBar";
import Hyperlink from "../../components/Hyperlink";
import ModalWindow from "../../components/ModalWindow/ModalWindow";
import { prompt } from "../../confirm_prompt_alert";
import { setAnalysisFileContent } from "../../dbInterface/dbInterface";
import { useGithubAuth } from "../../GithubAuth/useGithubAuth";
import useRoute from "../../useRoute";
import { useWorkspace } from "../WorkspacePage/WorkspacePageContext";
import AnalysisFileBrowser from "./AnalysisFileBrowser/AnalysisFileBrowser";
import { useAnalysis } from "./AnalysisPageContext";
import AnalysisSettingsWindow from "./AnalysisSettingsWindow";
import BackButton from "./BackButton";

type Props = {
    width: number
    height: number
}

const AnalysisLeftPanel: FunctionComponent<Props> = ({width, height}) => {
    const {analysisId, analysis, workspaceId, openTab, analysisFiles, setAnalysisProperty, refreshFiles} = useAnalysis()
    const {visible: settingsWindowVisible, handleOpen: openSettingsWindow, handleClose: closeSettingsWindow} = useModalDialog()
    const {workspace, workspaceRole} = useWorkspace()
    const {setRoute} = useRoute()
    const handleOpenFile = useCallback((fileName: string) => {
        openTab(`file:${fileName}`)
    }, [openTab])

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

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    const handleCreateFile = useCallback(async () => {
        const fileName = await prompt('Enter file name:', '')
        if (!fileName) return
        await setAnalysisFileContent(workspaceId, analysisId, fileName, '', auth)
        refreshFiles()
    }, [workspaceId, analysisId, auth, refreshFiles])

    const topHeight = 125
    const bottomHeight = 20
    const padding = 10
    const W = width - 2 * padding
    const H = height - 2 * padding
    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: W, height: H}}>
            <div style={{position: 'absolute', width: W, height: topHeight}}>
                <BackButton />
                <div style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    Analysis: {analysis?.name}&nbsp;
                    {
                        (workspaceRole === 'admin' || workspaceRole === 'editor') && (
                            <IconButton onClick={handleEditAnalysisName}><Edit fontSize="small" /></IconButton>
                        )
                    }
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td>ID:</td>
                            <td style={{whiteSpace: 'nowrap'}}>{analysisId}</td>
                        </tr>
                        <tr>
                            <td>Workspace:</td>
                            <td style={{whiteSpace: 'nowrap'}}><Hyperlink onClick={() => {setRoute({page: 'workspace', workspaceId})}}>{workspace?.name}</Hyperlink></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <button onClick={handleCreateFile}>Create file</button>
                </div>
            </div>
            <div style={{position: 'absolute', width: W, top: topHeight, height: H - topHeight - bottomHeight}}>
                <AnalysisFileBrowser
                    onOpenFile={handleOpenFile}
                />
            </div>
            <div style={{position: 'absolute', width: W, top: H - bottomHeight + 5, height: bottomHeight}}>
                <button onClick={openSettingsWindow}>Settings</button>
            </div>
            <ModalWindow
                open={settingsWindowVisible}
                onClose={closeSettingsWindow}
            >
                <AnalysisSettingsWindow />
            </ModalWindow>
        </div>
    )
}

export default AnalysisLeftPanel