import { FunctionComponent, useCallback } from "react";
import { useAnalysis } from "../AnalysisPageContext";

type Props = {
    scriptFileName: string
}

const CreateScriptJobComponent: FunctionComponent<Props> = ({ scriptFileName }) => {
    const {createScriptJob} = useAnalysis()

    const handleCreateJob = useCallback(async () => {
        createScriptJob({scriptFileName})
    }, [createScriptJob, scriptFileName])

    return (
        <>
            <button
                onClick={handleCreateJob}
            >Run script</button>
        </>
    )
}

export default CreateScriptJobComponent