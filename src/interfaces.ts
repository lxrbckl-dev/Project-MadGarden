export interface Repository {
  title: string;
  stack: string[];
  url: string;
  description: string;
}

export interface AutomatedData {
  repositories: Record<string, Repository>;
  languages: string[];
  packages: string[];
}

export interface ProjectReference {
  projectName: string;
  projectLink: string;
}

export type GardenData = Record<string, ProjectReference[]>;
