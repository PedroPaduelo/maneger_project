export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Account {
  id: string;
  provider: AccountProvider;
  providerAccountId: string;
  userId: string;
  user: User;
}

export interface Token {
  id: string;
  type: TokenType;
  createdAt: Date;
  expiresAt: Date;
  userId: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  stack: string;
  notes?: string;
  lastModel?: string;
  status: string;
  priority: string;
  progress: number;
  isFavorite: boolean;
  color?: string;
  tags?: string;
  metadata?: any;
  gitRepositoryUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  historySummaries: HistorySummary[];
  requirements: Requirement[];
  tasks: Task[];
  projectFavorites: ProjectFavorite[];
  projectTags: ProjectTag[];
  notifications: Notification[];
}

export interface Task {
  id: number;
  title: string;
  guidancePrompt: string;
  additionalInformation?: string;
  description?: string;
  status: string;
  createdBy: string;
  updatedBy: string;
  projectId: number;
  result?: string;
  createdAt: Date;
  updatedAt: Date;
  requirementTasks: RequirementTask[];
  taskTodos: TaskTodo[];
  project: Project;
}

export interface TaskTodo {
  id: number;
  taskId: number;
  description: string;
  isCompleted: boolean;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
  task: Task;
}

export interface Requirement {
  id: number;
  title: string;
  description: string;
  type: string;
  category?: string;
  priority: string;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
  requirementTasks: RequirementTask[];
}

export interface RequirementTask {
  id: number;
  taskId: number;
  requirementId: number;
  createdAt: Date;
  updatedAt: Date;
  requirement: Requirement;
  task: Task;
}

export interface HistorySummary {
  id: number;
  summary: string;
  projectId: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
}

export interface ProjectFavorite {
  id: number;
  projectId: number;
  userId: string;
  createdAt: Date;
  project: Project;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  projectTags: ProjectTag[];
}

export interface ProjectTag {
  id: number;
  projectId: number;
  tagId: number;
  createdAt: Date;
  project: Project;
  tag: Tag;
}

export interface ProjectHistory {
  id: number;
  projectId: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  userId: string;
  userName: string;
  description: string;
  createdAt: Date;
}

export interface Notification {
  id: number;
  projectId?: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  isRead: boolean;
  priority: string;
  createdAt: Date;
  readAt?: Date;
  project?: Project;
}

export enum AccountProvider {
  GOOGLE = "GOOGLE"
}

export enum TokenType {
  PASSWORD_RECOVER = "PASSWORD_RECOVER"
}