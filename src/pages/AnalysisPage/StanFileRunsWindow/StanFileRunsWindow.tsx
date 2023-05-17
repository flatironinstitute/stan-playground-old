import { FunctionComponent } from "react";
import CreateRunComponent from "./CreateRunComponent";
import StanFileRunsTable from "./StanFileRunsTable";

type Props = {
    width: number,
    height: number,
    fileName: string
}

const StanFileRunsWindow: FunctionComponent<Props> = ({ width, height, fileName }) => {
    return (
        <>
            <CreateRunComponent
                stanFileName={fileName}
            />
            <StanFileRunsTable
                fileName={fileName}
            />
        </>
    )
}

export default StanFileRunsWindow