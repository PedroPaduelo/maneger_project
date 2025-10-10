// Export hooks de queries e mutations
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useToggleFavorite,
  useDuplicateProject,
  projectKeys
} from './useProjects';

export {
  useTasks as useTasksQuery,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  taskKeys
} from './useTasksQuery';

export {
  useRequirements,
  useRequirement,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
  useUpdateRequirementPriority,
  requirementKeys
} from './useRequirements';

export {
  useTags,
  useTagsWithCount,
  useTag,
  useCreateTag,
  tagKeys
} from './useTags';

// Export hooks personalizados existentes (sem conflito)
export * from './useTasks';
export * from './useExecutor';