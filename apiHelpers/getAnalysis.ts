import { isSPAnalysis, SPAnalysis } from "../src/types/stan-playground-types"
import { getMongoClient } from "./getMongoClient"
import ObjectCache from "./ObjectCache"
import removeIdField from "./removeIdField"

const analysisCache = new ObjectCache<SPAnalysis>(1000 * 60 * 1)

const getAnalysis = async (analysisId: string, o: {useCache: boolean}) => {
    if (o.useCache) {
        const cachedAnalysis = analysisCache.get(analysisId)
        if (cachedAnalysis) {
            return cachedAnalysis
        }
    }
    const client = await getMongoClient()
    const analysesCollection = client.db('stan-playground').collection('analyses')
    const analysis = removeIdField(await analysesCollection.findOne({analysisId}))
    if (!analysis) {
        throw new Error('Analysis not found')
    }
    if (!isSPAnalysis(analysis)) {
        console.warn(analysis)
        throw new Error('Invalid analysis in database')
    }
    analysisCache.set(analysisId, analysis)
    return analysis
}

export const invalidateAnalysisCache = (analysisId: string) => {
    analysisCache.delete(analysisId)
}

export default getAnalysis