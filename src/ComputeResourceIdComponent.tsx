import { FunctionComponent } from "react";

type Props = {
    computeResourceId: string | undefined
}

const ComputeResourceIdComponent: FunctionComponent<Props> = ({ computeResourceId }) => {
    const x = abbreviate(computeResourceId || '', 10)
    return <span style={{color: '#345', fontStyle: 'italic'}}>{x}</span>
}

function abbreviate(s: string, maxLength: number) {
    if (s.length <= maxLength) return s
    return s.slice(0, maxLength - 3) + '...'
}

export default ComputeResourceIdComponent