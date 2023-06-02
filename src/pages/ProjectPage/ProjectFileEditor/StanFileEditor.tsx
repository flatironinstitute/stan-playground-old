import { AutoFixHigh, Chat } from "@mui/icons-material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import Splitter from "../../../components/Splitter";
import runStanc from "./runStanc";
import StanCompileResultWindow from "./StanCompileResultWindow";
import TextEditor, { ToolbarItem } from "./TextEditor";
import StanFileChatGPTWindow from "../StanFileChatGPTWindow/StanFileChatGPTWindow";


type Props = {
    fileName: string
    fileContent: string
    onSaveContent: (text: string) => void
    editedFileContent: string
    setEditedFileContent: (text: string) => void
    onDeleteFile?: () => void
    readOnly: boolean
    width: number
    height: number
}

const StanFileEditor: FunctionComponent<Props> = ({fileName, fileContent, onSaveContent, editedFileContent, setEditedFileContent, readOnly, width, height}) => {
    const handleAutoFormat = useCallback(() => {
        if (editedFileContent === undefined) return
        ;(async () => {
            const model = await runStanc('main.stan', editedFileContent, ["auto-format", "max-line-length=78"])
            if (model.result) {
                setEditedFileContent(model.result)
            }
        })()
    }, [editedFileContent, setEditedFileContent])

    const [chatGPTOpen, setChatGPTOpen] = useState<boolean>(false)

    const toolbarItems: ToolbarItem[] = useMemo(() => {
        const ret: ToolbarItem[] = []

        // auto format
        if (!readOnly) {
            if (editedFileContent !== undefined) {
                ret.push({
                    icon: <AutoFixHigh />,
                    tooltip: 'Auto format this stan file',
                    label: 'auto format',
                    onClick: handleAutoFormat,
                    color: 'darkblue'
                })
            }
        }

        ret.push({
            icon: <Chat />,
            tooltip: 'Ask ChatGPT',
            label: 'ask',
            onClick: () => setChatGPTOpen(a => !a),
            color: 'darkblue'
        })

        return ret
    }, [handleAutoFormat, editedFileContent, readOnly])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
            hideSecondChild={!chatGPTOpen}
        >
            <Splitter
                width={0}
                height={0}
                initialPosition={height * 2 / 3}
                direction="vertical"
            >
                <TextEditor
                    width={0}
                    height={0}
                    // language="stan"
                    language="stan"
                    label={fileName}
                    text={fileContent}
                    onSaveText={onSaveContent}
                    editedText={editedFileContent}
                    onSetEditedText={setEditedFileContent}
                    readOnly={readOnly}
                    toolbarItems={toolbarItems}
                />
                {
                    <StanCompileResultWindow
                        width={0}
                        height={0}
                        mainStanText={editedFileContent}
                    />
                }
            </Splitter>
            {/* Important to unconditionally include this second panel because otherwise the first window get removed from DOM when toggled, and that causes the editor changes to be undone */}
            <StanFileChatGPTWindow
                width={0}
                height={0}
                stanFileName={fileName}
                textHasBeenEdited={editedFileContent !== fileContent}
            />
        </Splitter>
    )
}

export default StanFileEditor