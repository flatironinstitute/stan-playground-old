import { FunctionComponent } from "react";

type Props = {
    userId: string | undefined
}

const UserIdComponent: FunctionComponent<Props> = ({ userId }) => {
    const x = userId ? (userId.startsWith('github|') ? userId.slice('github|'.length) : userId) : ''
    return <span>{x}</span>
}

export default UserIdComponent