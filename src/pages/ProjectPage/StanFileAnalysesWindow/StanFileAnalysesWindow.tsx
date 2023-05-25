import { FunctionComponent } from "react";

type Props = {
    width: number
    height: number
    stanFileName: string
}

const StanFileAnalysesWindow: FunctionComponent<Props> = ({width, height, stanFileName}) => {
    return (
        <div style={{width: width, height: height, backgroundColor: 'white'}}>
            <div style={{height: 30, backgroundColor: 'lightgray'}}>
                <div style={{padding: 5, fontWeight: 'bold'}}>Analyses for {stanFileName}</div>
            </div>
            <div style={{height: height - 30, backgroundColor: 'white'}}>

            </div>
        </div>
    )
}

export default StanFileAnalysesWindow