// Auto-generated Convex data model types
import { GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type DataModel = {
  classes: {
    _id: Id<"classes">;
    name: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    color?: string;
  };
  tasks: {
    _id: Id<"tasks">;
    title: string;
    classId?: Id<"classes">;
    isRecurring: boolean;
  };
  taskCompletions: {
    _id: Id<"taskCompletions">;
    taskId: Id<"tasks">;
    date: string;
    completed: boolean;
  };
  reminders: {
    _id: Id<"reminders">;
    title: string;
    message?: string;
    triggerTime: number;
    isActive: boolean;
    isDismissed: boolean;
    snoozedUntil?: number;
  };
  songs: {
    _id: Id<"songs">;
    name: string;
    artist?: string;
    classId?: Id<"classes">;
  };
  songStatuses: {
    _id: Id<"songStatuses">;
    songId: Id<"songs">;
    status: string;
  };
  songProgress: {
    _id: Id<"songProgress">;
    songId: Id<"songs">;
    date: string;
    practiced: boolean;
  };
  songSessions: {
    _id: Id<"songSessions">;
    songId: Id<"songs">;
    date: string;
    duration: number;
    notes?: string;
  };
  changelog: {
    _id: Id<"changelog">;
    version: string;
    date: string;
    changes: string[];
  };
};
