const removeIdField = (docs: any[]): any[] => {
    const ret: any[] = []
    for (const doc of docs) {
        const x = {}
        for (const key in doc) {
            if (key === '_id') continue // skip _id
            x[key] = doc[key]
        }
        ret.push(x)
    }
    return ret
}

export default removeIdField