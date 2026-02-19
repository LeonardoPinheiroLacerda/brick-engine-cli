export type Answers = {
  description: string;
  usePrettier: boolean;
  useESLint: boolean;
};

export type Dependency = {
  name: string;
  version: string;
  shouldInstall: boolean;
};

export type Scripts = {
  name: string;
  command: string;
  shouldInstall: boolean;
};
