export interface Tag {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Directory {
  id: number;
  path: string;
  created_at: string;
}

export interface DirectoryWithTags extends Directory {
  tags: Tag[];
}

export interface DirectoryTag {
  dir_id: number;
  tag_id: number;
}
