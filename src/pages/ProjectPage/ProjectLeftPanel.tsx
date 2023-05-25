import { Add, Edit, Refresh } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import { useModalDialog } from "../../ApplicationBar";
import Hyperlink from "../../components/Hyperlink";
import ModalWindow from "../../components/ModalWindow/ModalWindow";
import SmallIconButton from "../../components/SmallIconButton";
import { confirm, prompt } from "../../confirm_prompt_alert";
import { setProjectFileContent } from "../../dbInterface/dbInterface";
import { useGithubAuth } from "../../GithubAuth/useGithubAuth";
import useRoute from "../../useRoute";
import { useWorkspace } from "../WorkspacePage/WorkspacePageContext";
import ProjectFileBrowser2 from "./ProjectFileBrowser/ProjectFileBrowser2";
import { useProject } from "./ProjectPageContext";
import ProjectSettingsWindow from "./ProjectSettingsWindow";
import BackButton from "./BackButton";

type Props = {
    width: number
    height: number
}

const ProjectLeftPanel: FunctionComponent<Props> = ({width, height}) => {
    const {projectId, project, workspaceId, openTab, closeTab, projectFiles, setProjectProperty, refreshFiles, deleteFile} = useProject()
    const {visible: settingsWindowVisible, handleOpen: openSettingsWindow, handleClose: closeSettingsWindow} = useModalDialog()
    const {workspace, workspaceRole} = useWorkspace()
    const {setRoute} = useRoute()
    const handleOpenFile = useCallback((fileName: string) => {
        openTab(`file:${fileName}`)
    }, [openTab])

    const handleDeleteFile = useCallback(async (fileName: string) => {
        const okay = await confirm(`Delete ${fileName}?`)
        if (!okay) return
        deleteFile(fileName)
        closeTab(`file:${fileName}`)
    }, [deleteFile, closeTab])

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (!projectFiles) return
        if (initialized) return
        const stanFiles = projectFiles.filter(f => f.fileName.endsWith('.stan'))
        if (stanFiles.length === 1) {
            openTab(`file:${stanFiles[0].fileName}`)
        }
        setInitialized(true)
    }, [projectFiles, openTab, initialized])

    const handleEditProjectName = useCallback(async () => {
        const newName = await prompt('Enter new project name:', project?.name || '')
        if (!newName) return
        if (!project) return
        setProjectProperty('name', newName)
    }, [project, setProjectProperty])

    const {accessToken, userId} = useGithubAuth()
    const auth = useMemo(() => (accessToken ? {githubAccessToken: accessToken, userId} : {}), [accessToken, userId])

    const handleCreateFile = useCallback(async () => {
        const fileName = await prompt('Enter file name:', '')
        if (!fileName) return
        await setProjectFileContent(workspaceId, projectId, fileName, '', auth)
        refreshFiles()
    }, [workspaceId, projectId, auth, refreshFiles])

    const topHeight = 140
    const bottomHeight = 20
    const padding = 10
    const W = width - 2 * padding
    const H = height - 2 * padding
    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: W, height: H}}>
            <div style={{position: 'absolute', width: W, height: topHeight}}>
                <BackButton />
                <hr />
                <div style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    Project: {project?.name}&nbsp;
                    {
                        (workspaceRole === 'admin' || workspaceRole === 'editor') && (
                            <SmallIconButton onClick={handleEditProjectName} title="Edit project name" icon={<Edit />} />
                        )
                    }
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td>ID:</td>
                            <td style={{whiteSpace: 'nowrap'}}>{projectId}</td>
                        </tr>
                        <tr>
                            <td>Workspace:</td>
                            <td style={{whiteSpace: 'nowrap'}}><Hyperlink onClick={() => {setRoute({page: 'workspace', workspaceId})}}>{workspace?.name}</Hyperlink></td>
                        </tr>
                    </tbody>
                </table>
                <hr />
                <div>
                    <SmallIconButton onClick={handleCreateFile} title="Create a new file" icon={<Add />} />
                    <SmallIconButton onClick={refreshFiles} title="Refresh files" icon={<Refresh />} />
                </div>
            </div>
            <div style={{position: 'absolute', width: W, top: topHeight, height: H - topHeight - bottomHeight}}>
                <ProjectFileBrowser2
                    projectFiles={projectFiles}
                    onOpenFile={handleOpenFile}
                    onDeleteFile={handleDeleteFile}
                />
            </div>
            <div style={{position: 'absolute', width: W, top: H - bottomHeight + 5, height: bottomHeight}}>
                <button onClick={openSettingsWindow}>Settings</button>
            </div>
            <ModalWindow
                open={settingsWindowVisible}
                onClose={closeSettingsWindow}
            >
                <ProjectSettingsWindow />
            </ModalWindow>
        </div>
    )
}

export default ProjectLeftPanel