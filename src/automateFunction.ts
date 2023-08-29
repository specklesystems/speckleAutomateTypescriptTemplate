import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import ObjectLoader from '@speckle/objectloader'
import { parse } from 'graphql'
import { gql, request } from 'graphql-request'
import { z } from 'zod'
import fetch from 'node-fetch'
import { SpeckleProjectData } from './speckleProjectData.js'

export const FunctionInputSchema = z.object({
  speckleTypeToCount: z
    .string()
    .describe('The speckle object type that this function is going to count')
})

export type FunctionInputs = z.infer<typeof FunctionInputSchema>

const getCommitRootObjectId = async ({
  speckleServerUrl,
  projectId,
  versionId, speckleToken
}: {
  speckleServerUrl: string
  projectId: string
  versionId: string
  speckleToken: string
}): Promise<string> => {
  const endpoint = `${speckleServerUrl}/graphql`

  const query: TypedDocumentNode<
    { stream: { commit: { referencedObject: string } } },
    never | { projectId: string; versionId: string }
  > = parse(gql`
    query StreamCommit($projectId: String!, $versionId: String!) {
      stream(id: $projectId) {
        commit(id: $versionId) {
          referencedObject
        }
      }
    }
  `)
  const variables = {
    projectId,
    versionId
  }

  const data = await request(endpoint, query, variables, {
    Authorization: `Bearer ${speckleToken}`,
    'Content-Type': 'application/json',
  })
  return data.stream.commit.referencedObject
}

export async function automateFunction(
  speckleProjectData: SpeckleProjectData,
  functionInputs: FunctionInputs,
  speckleToken: string
) {
  const objectId = await getCommitRootObjectId({ ...speckleProjectData, speckleToken })

  let loader = new ObjectLoader({
    serverUrl: speckleProjectData.speckleServerUrl,
    streamId: speckleProjectData.projectId,
    token: speckleToken,
    objectId,
    options: {
      fetch,
      fullyTraverseArrays: false, // Default: false. By default, if an array starts with a primitive type, it will not be traversed. Set it to true if you want to capture scenarios in which lists can have intersped objects and primitives, e.g. [ 1, 2, "a", { important object } ]
      excludeProps: ['displayValue', 'displayMesh', '__closure'] // Default: []. Any prop names that you pass in here will be ignored from object construction traversal.

    }
  })

  let count = 0

  for await (const obj of loader.getObjectIterator()) {
    if (obj['speckle_type'] === functionInputs.speckleTypeToCount) count++
  }

  console.log(`Found ${count} objects that match the queried speckle type: ${functionInputs.speckleTypeToCount}`)
}
