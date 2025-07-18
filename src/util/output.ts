import chalk from "chalk";
import type { Tag, Directory, DirectoryWithTags } from "../types/models.js";

export function formatTag(tag: Tag): string {
  const name = chalk.cyan(tag.name);
  const desc = tag.description ? chalk.gray(` - ${tag.description}`) : '';
  return `${name}${desc}`;
}

export function formatDirectory(dir: Directory): string {
  return chalk.green(dir.path);
}

export function formatDirectoryWithTags(dir: DirectoryWithTags): string {
  const path = chalk.green(dir.path);
  if (dir.tags.length === 0) {
    return path;
  }
  
  const tags = dir.tags.map(tag => chalk.cyan(tag.name)).join(', ');
  return `${path} ${chalk.gray('[')}${tags}${chalk.gray(']')}`;
}

export function formatTagList(tags: Tag[]): void {
  if (tags.length === 0) {
    console.log(chalk.yellow('No tags found'));
    return;
  }
  
  console.log(chalk.bold('Tags:'));
  for (const tag of tags) {
    console.log(`  ${formatTag(tag)}`);
  }
}

export function formatDirectoryList(directories: DirectoryWithTags[]): void {
  if (directories.length === 0) {
    console.log(chalk.yellow('No directories found'));
    return;
  }
  
  console.log(chalk.bold('Directories:'));
  for (const dir of directories) {
    console.log(`  ${formatDirectoryWithTags(dir)}`);
  }
}

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}
