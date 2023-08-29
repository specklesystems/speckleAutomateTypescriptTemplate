import { writeFileSync } from 'fs'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { FunctionInputSchema } from './automateFunction.js'

const schema = zodToJsonSchema(FunctionInputSchema)

const args = process.argv.slice(2)

const fileName = args[0] || 'functionInputSchema.json'

writeFileSync(fileName, JSON.stringify(schema))
