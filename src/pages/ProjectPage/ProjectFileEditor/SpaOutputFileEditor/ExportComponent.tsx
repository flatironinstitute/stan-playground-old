import { FunctionComponent, useMemo, useState } from "react";
import { SpaOutput } from "./SpaOutputFileEditor";

type Props = {
    spaOutput: SpaOutput | undefined
}

const ExportComponent: FunctionComponent<Props> = ({spaOutput}) => {
    const [expanded, setExpanded] = useState(false)
    const exportText = useMemo(() => {
        if (!spaOutput) return undefined
        if (!expanded) return undefined
        const variableNames: string[] = []
        spaOutput.chains.forEach(c => {
            Object.keys(c.sequences).forEach(k => {
                if (!variableNames.includes(k)) variableNames.push(k)
            })
        })
        const lines: string[] = []
        lines.push('chain,draw,' + variableNames.join(','))
        for (const c of spaOutput.chains) {
            if (!variableNames[0]) continue
            const chainLabel = c.chainId.split('_').slice(-1)[0]
            const numDraws = c.sequences[variableNames[0]].length
            for (let i = 0; i < numDraws; i++) {
                lines.push(`${chainLabel},${i + 1},${variableNames.map(k => {
                    if (c.sequences[k]) {
                        return c.sequences[k][i]
                    }
                    else return ''
                }).join(',')}`)
            }
        }
        return lines.join('\n')
    }, [spaOutput, expanded])
    if (!spaOutput) return <div>...</div>
    if (!expanded) return (
        <div>
            <button onClick={() => {setExpanded(true)}}>Show export</button>
        </div>
    )
    return (
        <div>
            {/* Download button */}
            {exportText && <button onClick={() => {
                const blob = new Blob([exportText], {type: 'text/plain'})
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'export.csv'
                a.click()
            }}>Download</button>}
            <textarea readOnly value={exportText} style={{width: '100%', height: 200}} />
        </div>
    )
}

export default ExportComponent