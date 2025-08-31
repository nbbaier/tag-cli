import { Table } from "@cliffy/table";
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
  id: string | undefined;
  path: string;
  tags: string;
  created: string | undefined;
  updated: string | undefined;
};

export const DirectoryList = (
  dirs: DirectoryWithTags[],
  options: DirectoryListOptions = {},
) => {
  const finalOptions = { relativeTime: true, ...options };
  const includedFields = ["path", "tags"];

  if (finalOptions?.created) {
    includedFields.push("rowCreatedAt");
  }

  if (finalOptions?.updated) {
    includedFields.push("rowUpdatedAt");
  }

  if (finalOptions?.id) {
    includedFields.push("id");
  }

  const filteredDirs: FilteredDir[] = dirs
    .map((d) =>
      Object.fromEntries(
        Object.entries(d).filter(([key]) => includedFields.includes(key)),
      ),
    )
    .map((d) => {
      const tagString = d.tags
        .map((tag: Tag) => chalk.cyan(tag.name))
        .join(", ");
      return {
        id: d.id ? chalk.yellow(d.id) : undefined,
        path: chalk.green(replaceHomedir(d.path)),
        tags:
          finalOptions?.header || false
            ? tagString || chalk.gray("no tags")
            : chalk.gray(`[${tagString || chalk.gray("no tags")}]`),
        created: d.rowCreatedAt
          ? formatTime(d.rowCreatedAt, "created", finalOptions)
          : undefined,
        updated: d.rowUpdatedAt
          ? formatTime(d.rowUpdatedAt, "updated", finalOptions)
          : undefined,
      };
    })
    .map((d) => filterUndefined<string | undefined>(d)) as FilteredDir[];

  const table = new Table();

  if (finalOptions?.header) {
    table.header(
      Object.keys(filteredDirs[0] || {}).map((f) =>
        chalk.bold(capitalizeFirstLetter(f)),
      ),
    );
  }

  table.body(filteredDirs.map((d) => Object.values(d)));
  table.padding(2);
  table.align("left");

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
