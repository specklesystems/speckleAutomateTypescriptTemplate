import { automateFunction, FunctionInputSchema } from './automateFunction.js'
import { SpeckleProjectDataSchema } from './speckleProjectData.js'

const args = process.argv.slice(2)
console.log('argv:', args)
const argCount = args.length

if (argCount !== 3)
  throw Error(`The function needs 3 arguments to run, received ${argCount}`)

const [rawSpeckleProjectData, rawFunctionInputs, speckleToken] = args
const projectData = SpeckleProjectDataSchema.parse(JSON.parse(rawSpeckleProjectData))
const functionInputs = FunctionInputSchema.parse(JSON.parse(rawFunctionInputs))

await automateFunction(projectData, functionInputs, speckleToken)
