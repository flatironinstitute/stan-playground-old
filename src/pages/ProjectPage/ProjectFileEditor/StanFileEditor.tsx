import { AutoFixHigh } from "@mui/icons-material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import Splitter from "../../../components/Splitter";
import StanFileAnalysesWindow from "../StanFileAnalysesWindow/StanFileAnalysesWindow";
import runStanc from "./runStanc";
import StanCompileResultWindow from "./StanCompileResultWindow";
import TextEditor, { ToolbarItem } from "./TextEditor";

type Props = {
    fileName: string
    fileContent: string
    setFileContent: (text: string) => void
    onDeleteFile?: () => void
    readOnly: boolean
    width: number
    height: number
}

const StanFileEditor: FunctionComponent<Props> = ({fileName, fileContent, setFileContent, onDeleteFile, readOnly, width, height}) => {
    const [editedText, setEditedText] = useState<string>(fileContent)
    const [editedStanTextOverrider, setEditedStanTextOverrider] = useState<(text: string) => void>()
    const handleEditedTextOverrider = useCallback((overrider: (text: string) => void) => {
        setEditedStanTextOverrider(() => overrider)
    }, [])

    const handleAutoFormat = useCallback(() => {
        if (editedText === undefined) return
        if (editedStanTextOverrider === undefined) return
        ;(async () => {
            const model = await runStanc('main.stan', editedText, ["auto-format", "max-line-length=78"])
            if (model.result) {
                editedStanTextOverrider(model.result)
            }
        })()
    }, [editedText, editedStanTextOverrider])

    const toolbarItems: ToolbarItem[] = useMemo(() => {
        const ret: ToolbarItem[] = []

        // auto format
        if (!readOnly) {
            if (editedText !== undefined) {
                ret.push({
                    icon: <AutoFixHigh />,
                    label: 'Auto Format',
                    onClick: handleAutoFormat,
                    color: 'darkblue'
                })
            }
        }

        return ret
    }, [handleAutoFormat, editedText, readOnly])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
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
                    onSetText={setFileContent}
                    // onReload={refreshMainStanText}
                    onEditedTextChanged={setEditedText}
                    onEditedTextOverrider={handleEditedTextOverrider}
                    onDeleteFile={onDeleteFile}
                    readOnly={readOnly}
                    toolbarItems={toolbarItems}
                />
                {
                    <StanCompileResultWindow
                        width={0}
                        height={0}
                        mainStanText={editedText}
                    />
                }
            </Splitter>
            <StanFileAnalysesWindow
                width={0}
                height={0}
                stanFileName={fileName}
            />
        </Splitter>
    )
}

export default StanFileEditor