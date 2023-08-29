import { z } from 'zod'

export const SpeckleProjectDataSchema = z.object({
  projectId: z.string(),
  modelId: z.string(),
  versionId: z.string(),
  speckleServerUrl: z.string().url()
})

export type SpeckleProjectData = z.infer<typeof SpeckleProjectDataSchema>
