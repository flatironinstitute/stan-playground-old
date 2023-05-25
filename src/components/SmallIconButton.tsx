import { FunctionComponent, PropsWithChildren } from "react";
import "./SmallIconButton.css"

type Props = {
    onClick?: () => void
    title?: string
    disabled?: boolean
    icon: any
    fontSize?: number
}

const SmallIconButton: FunctionComponent<PropsWithChildren<Props>> = ({icon, onClick, title, disabled, fontSize}) => {
    const classNames = ['SmallIconButton']
    if (disabled) classNames.push('disabled')
    else classNames.push('enabled')
    return (
        <span title={title}>
            <icon.type className={classNames.join(" ")} {...icon.props} style={{fontSize: fontSize || 18, verticalAlign: 'bottom'}} onClick={!disabled ? onClick : undefined} />
        </span>
    )
}

export default SmallIconButton