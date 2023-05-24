import { SPWorkspace } from "../src/types/stan-playground-types"
import getWorkspaceRole from './getWorkspaceRole'

export const userCanCreateAnalysis = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return ((workspaceRole === 'admin' || workspaceRole === 'editor'))
}

export const userCanCreateAnalysisRun = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return ((workspaceRole === 'admin' || workspaceRole === 'editor'))
}

export const userCanCreateWorkspace = (userId: string | undefined): boolean => {
    if (userId) {
        return true
    }
    return false
}

export const userCanDeleteAnalysis = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) return false
    const workspaceRole = getWorkspaceRole(workspace, userId)
    if (workspaceRole === 'admin' || workspaceRole === 'editor') {
        return true
    }
    return false
}

export const userCanDeleteAnalysisRun = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) return false
    const workspaceRole = getWorkspaceRole(workspace, userId)
    if (workspaceRole === 'admin' || workspaceRole === 'editor') {
        return true
    }
    return false
}

export const userCanDeleteWorkspace = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) {
        return false
    }
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return workspaceRole === 'admin'
}

export const userCanReadWorkspace = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return ((workspaceRole === 'admin' || workspaceRole === 'editor' || workspaceRole === 'viewer'))
}

export const userCanSetAnalysisFile = (workspace: SPWorkspace, userId: string | undefined, clientId: string | undefined): boolean => {
    if (clientId) {
        if ((workspace.computeResourceId) && (workspace.computeResourceId === clientId)) {
            return true
        }
    }
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return ((workspaceRole === 'admin' || workspaceRole === 'editor'))
}

export const userCanSetWorkspaceProperty = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return (workspaceRole === 'admin')
}

export const userCanSetWorkspaceUsers = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return (workspaceRole === 'admin')
}

export const userCanSetAnalysisProperty = (workspace: SPWorkspace, userId: string | undefined, property: string): boolean => {
    const workspaceRole = getWorkspaceRole(workspace, userId)
    return ((workspaceRole === 'admin' || workspaceRole === 'editor'))
}