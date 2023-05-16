import React, { FunctionComponent, PropsWithChildren } from "react";

type Props ={
	onClick: () => void
	color?: string
	disabled?: boolean
}

const Hyperlink: FunctionComponent<PropsWithChildren<Props>> = ({children, onClick, color, disabled}) => {
	return (
		!disabled ? (
			<a onClick={onClick} style={{cursor: 'pointer', color: color || 'darkblue'}}>{children}</a>
		) : (
			<span style={{color: 'gray'}}>{children}</span>
		)
	)
}

export default Hyperlink
