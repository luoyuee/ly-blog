export interface SendEmailForm {
  to: string[];
  subject: string;
  content: string;
}

export interface Task {
  name: string;
  description: string;
}

export interface ScheduledTask {
  cron: string;
  tasks: string[];
}

export interface GetTasksResponse {
  scheduledTasks: ScheduledTask[];
  tasks: Task[];
}
