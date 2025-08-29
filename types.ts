
export interface File {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content: string;
  children?: File[];
}
