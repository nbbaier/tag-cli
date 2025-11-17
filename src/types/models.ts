export interface Tag {
  id: number;
  name: string;
  description: string | null;
  rowCreatedAt: Date | null;
  rowUpdatedAt: Date | null;
}

export interface Directory {
  id: number;
  path: string;
  rowCreatedAt: Date | null;
  rowUpdatedAt: Date | null;
}

export interface DirectoryWithTags extends Directory {
  tags: Tag[];
}

export interface DirectoryTag {
  dirId: number;
  tagId: number;
  rowCreatedAt: Date | null;
  rowUpdatedAt: Date | null;
}
