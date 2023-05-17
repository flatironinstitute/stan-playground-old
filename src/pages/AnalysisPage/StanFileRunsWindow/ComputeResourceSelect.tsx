import { FunctionComponent, useMemo } from "react";

type Props = {
    selectedComputeResourceId: string,
    setSelectedComputeResourceId: (computeResourceId: string) => void
}

const ComputeResourceSelect: FunctionComponent<Props> = ({selectedComputeResourceId, setSelectedComputeResourceId}) => {
    const computeResourceIds = useMemo(() => {
        return ['default']
    }, [])
    return (
        <select
            value={selectedComputeResourceId}
            onChange={e => setSelectedComputeResourceId(e.target.value)}
        >
            {
                computeResourceIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                ))
            }
        </select>
    )
}

export default ComputeResourceSelect