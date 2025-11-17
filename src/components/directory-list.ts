import Table from "cli-table";
import chalk from "chalk";
import type { DirectoryWithTags, Tag } from "@/types";
import { capitalizeFirstLetter, filterUndefined } from "@/utils";
import { replaceHomedir } from "@/utils/path";
import { getRelativeTimeString } from "@/utils/time";

export type DirectoryListOptions = {
  created?: boolean;
  updated?: boolean;
  header?: boolean;
  id?: boolean;
  relativeTime?: boolean;
};

type FilteredDir = {
  id?: string;
  path: string;
  tags: string;
  created?: string;
  updated?: string;
};

export const DirectoryList = (
  dirs: DirectoryWithTags[],
  options: DirectoryListOptions = {},
) => {
  const finalOptions = { relativeTime: true, ...options };

  const filteredDirs = dirs.map((d) => {
    const tagString = d.tags
      .map((tag: Tag) => chalk.cyan(tag.name))
      .join(", ");

    const result: FilteredDir = {
      path: chalk.green(replaceHomedir(d.path)),
      tags:
        finalOptions?.header || false
          ? tagString || chalk.gray("no tags")
          : chalk.gray(`[${tagString || chalk.gray("no tags")}]`),
    };

    if (finalOptions?.id) {
      result.id = d.id ? chalk.yellow(String(d.id)) : undefined;
    }

    if (finalOptions?.created && d.rowCreatedAt) {
      result.created = formatTime(
        new Date(d.rowCreatedAt),
        "created",
        finalOptions,
      );
    }

    if (finalOptions?.updated && d.rowUpdatedAt) {
      result.updated = formatTime(
        new Date(d.rowUpdatedAt),
        "updated",
        finalOptions,
      );
    }

    return filterUndefined(result) as FilteredDir;
  });

  const headers = finalOptions?.header
    ? Object.keys(filteredDirs[0] || {}).map((f) =>
        chalk.bold(capitalizeFirstLetter(f)),
      )
    : undefined;

  const table = new Table({
    head: headers,
    colAligns: ["left"],
    style: {
      head: [],
      border: [],
    },
  });

  for (const dir of filteredDirs) {
    table.push(Object.values(dir));
  }

  return table;
};

const formatTime = (
  date: Date,
  action: "updated" | "created",
  finalOptions: DirectoryListOptions,
) => {
  const dateStr = date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeString = finalOptions?.relativeTime
    ? getRelativeTimeString(date)
    : `${dateStr} @ ${timeStr}`;

  return finalOptions?.header
    ? chalk.gray(timeString)
    : chalk.gray(`[${action}: ${timeString}]`);
};
