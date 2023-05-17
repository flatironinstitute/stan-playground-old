import { FunctionComponent, useCallback } from "react";
import Splitter from "../../components/Splitter";
import TabWidget from "../../TabWidget/TabWidget";
import AnalysisFileBrowser from "./AnalysisFileBrowser/AnalysisFileBrowser";
import AnalysisFileEditor from "./AnalysisFileEditor/AnalysisFileEditor";
import { SetupAnalysisPage, useAnalysis } from "./AnalysisPageContext";
import BackButton from "./BackButton";

type Props = {
    width: number
    height: number
    analysisId: string
}

const WorkspacePage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    const initialPosition = Math.max(200, Math.min(500, width / 4))
    return (
        <SetupAnalysisPage
            analysisId={analysisId}
        >
            <Splitter
                width={width}
                height={height}
                initialPosition={initialPosition}
                direction='horizontal'
            >
                <LeftPanel />
                <MainPanel width={0} height={0} />
            </Splitter>
        </SetupAnalysisPage>
    )
}

const LeftPanel: FunctionComponent = () => {
    const {analysisId, openTab} = useAnalysis()
    const handleOpenFile = useCallback((fileName: string) => {
        openTab(`file:${fileName}`)
    }, [openTab])
    return (
        <>
            <BackButton />
            <div>Analysis: {analysisId}</div>
            <AnalysisFileBrowser
                onOpenFile={handleOpenFile}
            />
        </>
    )
}

const labelFromTabName = (tabName: string) => {
    if (tabName.startsWith('file:')) {
        return tabName.slice('file:'.length)
    }
    return tabName
}


const MainPanel: FunctionComponent<{width: number, height: number}> = ({width, height}) => {
    const {openTabNames, currentTabName, setCurrentTab, closeTab} = useAnalysis()
    return (
        <TabWidget
            width={width}
            height={height}
            tabs={
                openTabNames.map(tabName => ({
                    id: tabName,
                    label: labelFromTabName(tabName),
                    closeable: true
                }))
            }
            currentTabId={currentTabName}
            setCurrentTabId={setCurrentTab}
            onCloseTab={fileName => closeTab(fileName)}
        >
            {openTabNames.map(tabName => (
                tabName.startsWith('file:') ? (
                    <AnalysisFileEditor
                        key={tabName}
                        fileName={tabName.slice('file:'.length)}
                        width={0}
                        height={0}
                    />
                ) : (
                    <div key={tabName}>Not implemented</div>
                )
            ))}
        </TabWidget>
    )
}

export default WorkspacePage