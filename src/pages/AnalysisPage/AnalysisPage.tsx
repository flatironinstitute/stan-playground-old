import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import TabWidget from "../../TabWidget/TabWidget";
import AnalysisFileBrowser from "./AnalysisFileBrowser/AnalysisFileBrowser";
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
    const {analysisId, openFile} = useAnalysis()
    return (
        <>
            <BackButton />
            <div>Analysis: {analysisId}</div>
            <AnalysisFileBrowser
                onOpenFile={openFile}
            />
        </>
    )
}

const MainPanel: FunctionComponent<{width: number, height: number}> = ({width, height}) => {
    const {openFileNames, currentFileName, setCurrentFile} = useAnalysis()
    return (
        <TabWidget
            width={width}
            height={height}
            tabs={
                openFileNames.map(fileName => ({
                    id: fileName,
                    label: fileName,
                    closeable: true
                }))
            }
            currentTabId={currentFileName}
            setCurrentTabId={setCurrentFile}
        >
            {openFileNames.map(fileName => (
                <div key={fileName}>{fileName}</div>
            ))}
        </TabWidget>
    )
}

export default WorkspacePage