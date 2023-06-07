import { ChangeEvent, FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import yaml from 'js-yaml'
import Hyperlink from "../../../components/Hyperlink";
import { useProject } from "../ProjectPageContext";
import SmallIconButton from "../../../components/SmallIconButton";
import { Cancel, Edit, Save } from "@mui/icons-material";

type Props = {
    width: number
    height: number
    text: string
    onSetText: (text: string) => void
    readOnly: boolean
    outputFileName?: string
}

type Spa = {
    stan?: string
    data?: string
    options?: {
        iter_sampling?: number
        iter_warmup?: number
        save_warmup?: boolean
        chains?: number
        seed?: number
    }
    required_resources?: {
        num_cpus: number
        ram_gb: number
        timeout_sec: number
    }
}

const options: {
    key: string
    label: string
    type: 'number' | 'boolean' | 'string'
    required: boolean
    resources?: boolean
}[] = [
    {key: 'iter_sampling', label: 'iter_sampling', type: 'number', required: true},
    {key: 'iter_warmup', label: 'iter_warmup', type: 'number', required: true},
    {key: 'save_warmup', label: 'save_warmup', type: 'boolean', required: true},
    {key: 'chains', label: 'chains', type: 'number', required: true},
    {key: 'seed', label: 'seed', type: 'number', required: false},
    {key: 'num_cpus', label: 'num. CPUs', type: 'number', required: true, resources: true},
    {key: 'ram_gb', label: 'RAM (GB)', type: 'number', required: true, resources: true},
    {key: 'timeout_sec', label: 'timeout (sec)', type: 'number', required: true, resources: true}
]

const SpaFileEditor: FunctionComponent<Props> = ({width, height, text, onSetText, readOnly, outputFileName}) => {
    const {openTab, fileHasBeenEdited} = useProject()
    const [editText, setEditText] = useState<string | undefined>(undefined)
    useEffect(() => {
        setEditText(text)
    }, [text])

    const spa: Spa | undefined = useMemo(() => {
        if (editText === undefined) return undefined
        try {
            return yaml.load(editText) || {} as Spa
        } catch (e) {
            console.warn(editText)
            console.warn('Error parsing spa yaml')
            return {} as Spa
        }
    }, [editText])

    const [editing, setEditing] = useState(false)

    const handleSave = useCallback(() => {
        if (editText) {
            onSetText(editText)
        }
        setEditing(false)
    }, [editText, onSetText])

    const handleCancel = useCallback(() => {
        setEditText(text)
        setEditing(false)
    }, [text])

    const canSave = useMemo(() => (
        editText !== text
    ), [editText, text])

    const stanFileEdited = useMemo(() => (fileHasBeenEdited(spa?.stan || '')), [spa?.stan, fileHasBeenEdited])
    const dataFileEdited = useMemo(() => (fileHasBeenEdited(spa?.data || '')), [spa?.data, fileHasBeenEdited])

    if (spa === undefined) {
        return (
            <div style={{position: 'absolute', width, height, overflow: 'auto', background: 'lightgray'}}>
                Loading...
            </div>
        )
    }
    const iconButtonFontSize = 22

    return (
        <div style={{position: 'absolute', width, height, overflow: 'auto', background: '#eee'}}>
            <div style={{padding: 10}}>
                <div>
                    {
                        !editing && (
                            readOnly ? (
                                <span>read only</span>
                            ) : (
                                <SmallIconButton icon={<Edit />} onClick={() => setEditing(true)} title="Edit .spa file" label="Edit" fontSize={iconButtonFontSize} />
                            )
                        )
                    }
                    {
                        editing && <SmallIconButton disabled={!canSave} icon={<Save />} onClick={handleSave} title="Save changes to .spa file" fontSize={iconButtonFontSize} label="Save" />
                    }
                    {
                        editing && <span>&nbsp;&nbsp;&nbsp;</span>
                    }
                    {
                        editing && <SmallIconButton icon={<Cancel />} onClick={handleCancel} title="Cancel editing" fontSize={iconButtonFontSize} label="Cancel" />
                    }
                </div>
                <hr />
                <table className="table1" style={{maxWidth: 400}}>
                    <tbody>
                        <tr>
                            <td>Stan file</td>
                            <td>
                                {
                                    editing ? (
                                        <StanFileSelector value={spa.stan} onChange={stan => setEditText(yaml.dump({...spa, stan}))} />
                                    ) : (
                                        <span>
                                            <Hyperlink onClick={() => spa.stan && openTab(`file:${spa.stan}`)}>{spa.stan || ''}</Hyperlink>
                                            {
                                                stanFileEdited && <span style={{color: 'red'}}> (edited)</span>
                                            }
                                        </span>
                                    )
                                }
                            </td>
                        </tr>
                        <tr>
                            <td>Data file</td>
                            <td>
                                {
                                    editing ? (
                                        <DataFileSelector value={spa.data} onChange={data => setEditText(yaml.dump({...spa, data}))} />
                                    ) : (
                                        <span>
                                            <Hyperlink onClick={() => spa.data && openTab(`file:${spa.data}`)}>{spa.data || ''}</Hyperlink>
                                            {
                                                dataFileEdited && <span style={{color: 'red'}}> (edited)</span>
                                            }
                                        </span>
                                    )
                                }
                            </td>
                        </tr>
                        {
                            !editing && (
                                <tr>
                                    <td>Output file</td>
                                    <td>
                                        <Hyperlink onClick={() => {outputFileName && openTab(`file:${outputFileName}`)}}>{outputFileName || ''}</Hyperlink>
                                    </td>
                                </tr>
                            )
                        }
                        {
                            options.filter(o => !o.resources).map(option => (
                                <tr key={option.key}>
                                    <td>{option.label}</td>
                                    <td>
                                        {
                                            editing ? (
                                                <OptionInput
                                                    value={(spa.options as any)?.[option.key]}
                                                    type={option.type}
                                                    required={option.required}
                                                    onChange={value => setEditText(yaml.dump({...spa, options: {...spa.options, [option.key]: value}}))}
                                                />
                                            ) : (
                                                <OptionDisplay
                                                    value={(spa.options as any)?.[option.key]}
                                                    type={option.type}
                                                />
                                            )
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <h4>Required resources (may affect whether or how quickly the job gets picked up by a compute resource):</h4>
                <table className="table1" style={{maxWidth: 400}}>
                    <tbody>
                        {
                            options.filter(o => o.resources).map(option => (
                                <tr key={option.key}>
                                    <td>{option.label}</td>
                                    <td>
                                        {
                                            editing ? (
                                                <OptionInput
                                                    value={(spa.required_resources as any)?.[option.key]}
                                                    type={option.type}
                                                    required={option.required}
                                                    onChange={value => setEditText(yaml.dump({...spa, required_resources: {...spa.required_resources, [option.key]: value}}))}
                                                />
                                            ) : (
                                                <OptionDisplay
                                                    value={(spa.required_resources as any)?.[option.key]}
                                                    type={option.type}
                                                />
                                            )
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const StanFileSelector: FunctionComponent<{value?: string, onChange: (value: string) => void}> = ({value, onChange}) => {
    const {projectFiles} = useProject()
    const stanFiles = useMemo(() => (
        (projectFiles || []).filter(f => f.fileName.endsWith('.stan'))
    ), [projectFiles])
    return (
        <select value={value} onChange={e => onChange(e.target.value)}>
            <option value="">Select a stan file</option>
            {
                stanFiles.map(f => (
                    <option key={f.fileName} value={f.fileName}>{f.fileName}</option>
                ))
            }
        </select>
    )
}

const DataFileSelector: FunctionComponent<{value?: string, onChange: (value: string) => void}> = ({value, onChange}) => {
    const {projectFiles} = useProject()
    const stanFiles = useMemo(() => (
        (projectFiles || []).filter(f => f.fileName.endsWith('.json'))
    ), [projectFiles])
    return (
        <select value={value} onChange={e => onChange(e.target.value)}>
            <option value="">Select a data file</option>
            {
                stanFiles.map(f => (
                    <option key={f.fileName} value={f.fileName}>{f.fileName}</option>
                ))
            }
        </select>
    )
}

const OptionInput: FunctionComponent<{value?: string | number | boolean, type: 'string' | 'number' | 'boolean', required: boolean, onChange: (value: string | number | boolean) => void}> = ({value, type, required, onChange}) => {
    const [editValue, setEditValue] = useState<string>()
    useEffect(() => {
        if (type === 'number') {
            setEditValue(value + '')
        }
        else if (type === 'boolean') {
            setEditValue(value ? 'true' : 'false')
        }
        else if (type === 'string') {
            setEditValue(value + '')
        }
    }, [value, type])
    useEffect(() => {
        if (type === 'number') {
            const isValidNumber = editValue !== undefined && (!isNaN(Number(editValue)))
            if (isValidNumber) {
                onChange(Number(editValue))
            }
        }
        else if (type === 'boolean') {
            const isValidBoolean = (editValue === 'true' || editValue === 'false')
            if (isValidBoolean) {
                onChange(editValue === 'true')
            }
        }
        else if (type === 'string') {
            onChange(editValue || '')
        }
    }, [editValue, type, onChange])
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value)
    }, [])
    const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setEditValue(e.target.value)
    }, [])
    if (editValue === undefined) return null
    if (type === 'boolean') {
        return (
            <select value={editValue} onChange={handleSelectChange}>
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        )
    }
    else {
        return (
            <input
                type="text"
                value={editValue}
                onChange={handleInputChange}
            />
        )
    }
}

const OptionDisplay: FunctionComponent<{value?: string | number | boolean, type: 'string' | 'number' | 'boolean'}> = ({value, type}) => {
    if (type === 'number') {
        return <span>{value}</span>
    }
    else if (type === 'boolean') {
        return <span>{value ? 'true' : 'false'}</span>
    }
    else if (type === 'string') {
        return <span>{value}</span>
    }
    return null
}

export default SpaFileEditor