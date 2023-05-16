import { FunctionComponent } from "react"
import Hyperlink from "../../components/Hyperlink"
import useRoute from "../../useRoute"
import { useAnalysis } from "./AnalysisPageContext"

const BackButton: FunctionComponent = () => {
    const {setRoute} = useRoute()
    const {workspaceId} = useAnalysis()
    return (
        <Hyperlink onClick={() => setRoute({page: 'workspace', workspaceId})}>&#8592; Workspace</Hyperlink>
    )
}

export default BackButton