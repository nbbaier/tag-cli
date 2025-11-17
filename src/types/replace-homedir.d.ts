declare module "replace-homedir" {
  export default function replaceHomedir(
    path: string,
    replacement?: string,
  ): string;
}
