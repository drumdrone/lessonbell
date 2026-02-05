/* eslint-disable */
// Auto-generated Convex API
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import * as classes from "../classes";
import * as tasks from "../tasks";
import * as reminders from "../reminders";
import * as songs from "../songs";
import * as changelog from "../changelog";

export const api = {
  classes: {
    getAll: "classes:getAll" as unknown as FunctionReference<"query">,
    add: "classes:add" as unknown as FunctionReference<"mutation">,
    update: "classes:update" as unknown as FunctionReference<"mutation">,
    remove: "classes:remove" as unknown as FunctionReference<"mutation">,
  },
  tasks: {
    getAll: "tasks:getAll" as unknown as FunctionReference<"query">,
    getAllCompletions: "tasks:getAllCompletions" as unknown as FunctionReference<"query">,
    add: "tasks:add" as unknown as FunctionReference<"mutation">,
    remove: "tasks:remove" as unknown as FunctionReference<"mutation">,
    toggleCompletion: "tasks:toggleCompletion" as unknown as FunctionReference<"mutation">,
  },
  reminders: {
    getActiveReminders: "reminders:getActiveReminders" as unknown as FunctionReference<"query">,
    getDueReminders: "reminders:getDueReminders" as unknown as FunctionReference<"query">,
    addReminder: "reminders:addReminder" as unknown as FunctionReference<"mutation">,
    updateReminder: "reminders:updateReminder" as unknown as FunctionReference<"mutation">,
    deleteReminder: "reminders:deleteReminder" as unknown as FunctionReference<"mutation">,
    dismissReminder: "reminders:dismissReminder" as unknown as FunctionReference<"mutation">,
    snoozeReminder: "reminders:snoozeReminder" as unknown as FunctionReference<"mutation">,
  },
  songs: {
    getAll: "songs:getAll" as unknown as FunctionReference<"query">,
    getAllStatuses: "songs:getAllStatuses" as unknown as FunctionReference<"query">,
    getAllProgress: "songs:getAllProgress" as unknown as FunctionReference<"query">,
    getAllSessions: "songs:getAllSessions" as unknown as FunctionReference<"query">,
    addSong: "songs:addSong" as unknown as FunctionReference<"mutation">,
    deleteSong: "songs:deleteSong" as unknown as FunctionReference<"mutation">,
    updateStatus: "songs:updateStatus" as unknown as FunctionReference<"mutation">,
    toggleProgress: "songs:toggleProgress" as unknown as FunctionReference<"mutation">,
    addSession: "songs:addSession" as unknown as FunctionReference<"mutation">,
    deleteSession: "songs:deleteSession" as unknown as FunctionReference<"mutation">,
  },
  changelog: {
    getAll: "changelog:getAll" as unknown as FunctionReference<"query">,
    add: "changelog:add" as unknown as FunctionReference<"mutation">,
    remove: "changelog:remove" as unknown as FunctionReference<"mutation">,
  },
};
