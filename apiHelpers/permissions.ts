import { SPWorkspace } from "../src/types/stan-playground-types"

export const userCanCreateAnalysis = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (workspace.ownerId === userId) {
        return true
    }
    const user = workspace.users.find(x => x.userId === userId)
    if (user && (user.role === 'admin' || user.role === 'editor')) {
        return true
    }
    if (user && (workspace.loggedInUserRole === 'editor')) {
        return true
    }
    if (workspace.anonymousUserRole === 'editor') {
        return true
    }
    return false
}

export const userCanCreateAnalysisRun = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    return userCanCreateAnalysis(workspace, userId)
}

export const userCanCreateWorkspace = (userId: string | undefined): boolean => {
    if (userId) {
        return true
    }
    return false
}

export const userCanDeleteAnalysis = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) {
        return false
    }
    return userCanCreateAnalysis(workspace, userId)
}

export const userCanDeleteAnalysisRun = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    return userCanDeleteAnalysis(workspace, userId)
}

export const userCanDeleteWorkspace = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) {
        return false
    }
    if (workspace.ownerId === userId) {
        return true
    }
    const user = workspace.users.find(x => x.userId === userId)
    if (user && user.role === 'admin') {
        return true
    }
    return false
}

export const userCanReadWorkspace = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (userId) {
        if (workspace.ownerId === userId) {
            return true
        }
        if (workspace.loggedInUserRole === 'editor' || workspace.loggedInUserRole === 'viewer') {
            return true
        }
        const user = workspace.users.find(x => x.userId === userId)
        if (user && (user.role === 'admin' || user.role === 'editor' || user.role === 'viewer')) {
            return true
        }
    }
    else {
        if ((workspace.anonymousUserRole === 'viewer') || (workspace.anonymousUserRole === 'editor')) {
            return true
        }
    }
    return false
}

export const userCanSetAnalysisFile = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    return userCanCreateAnalysis(workspace, userId)
}

export const userCanSetWorkspaceProperty = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) {
        return false
    }
    if (workspace.ownerId === userId) {
        return true
    }
    const user = workspace.users.find(x => x.userId === userId)
    if (user && user.role === 'admin') {
        return true
    }
    return false
}

export const userCanSetWorkspaceUsers = (workspace: SPWorkspace, userId: string | undefined): boolean => {
    if (!userId) {
        return false
    }
    if (workspace.ownerId === userId) {
        return true
    }
    const user = workspace.users.find(x => x.userId === userId)
    if (user && user.role === 'admin') {
        return true
    }
    return false
}

export const userCanSetAnalysisProperty = (workspace: SPWorkspace, userId: string | undefined, property: string): boolean => {
    if (workspace.ownerId === userId) {
        return true
    }
    if (userId) {
        const user = workspace.users.find(x => x.userId === userId)
        if (user && (user.role === 'admin' || user.role === 'editor')) {
            return true
        }
        if (user && (workspace.loggedInUserRole === 'editor')) {
            return true
        }
    }
    else {
        if (workspace.anonymousUserRole === 'editor') {
            return true
        }
    }
    return false
}