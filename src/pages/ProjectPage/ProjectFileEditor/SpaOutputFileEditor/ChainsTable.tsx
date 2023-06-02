import { FunctionComponent } from "react";
import { SpaOutput } from "./SpaOutputFileEditor";

type Props = {
    spaOutput: SpaOutput | undefined
}

const ChainsTable: FunctionComponent<Props> = ({spaOutput}) => {
    if (!spaOutput) return <div>No spa output</div>
    return (
        <table className="scientific-table" style={{maxWidth: 800}}>
            <thead>
                <tr>
                    <th>Chain</th>
                    <th>Variables</th>
                    <th>Num. draws</th>
                </tr>
            </thead>
            <tbody>
                {spaOutput.chains.map((chain, index) => (
                    <tr key={index}>
                        <td>{chain.chainId}</td>
                        <td>{Object.keys(chain.sequences || {}).join(', ')}</td>
                        <td>{chain?.sequences[Object.keys(chain.sequences || {})[0] || '']?.length}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ChainsTable