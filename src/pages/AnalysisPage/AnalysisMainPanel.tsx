import { FunctionComponent } from "react";
import TabWidget from "../../TabWidget/TabWidget";
import AnalysisFileEditor from "./AnalysisFileEditor/AnalysisFileEditor";
import { useAnalysis } from "./AnalysisPageContext";

const AnalysisMainPanel: FunctionComponent<{width: number, height: number}> = ({width, height}) => {
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

const labelFromTabName = (tabName: string) => {
    if (tabName.startsWith('file:')) {
        return tabName.slice('file:'.length)
    }
    return tabName
}

export default AnalysisMainPanel