import { Octokit } from 'octokit';

export class OctokitClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async readFileContents<T = any>(
    owner: string,
    repo: string,
    path: string,
    branch: string
  ): Promise<T> {
    const response = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(response.data)) {
      throw new Error(`Path "${path}" is a directory, not a file`);
    }

    if (response.data.type !== 'file') {
      throw new Error(`Path "${path}" is not a file`);
    }

    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return JSON.parse(content) as T;
  }

  async writeFileContents(
    owner: string,
    repo: string,
    path: string,
    data: unknown,
    branch: string,
    commitMessage: string
  ): Promise<void> {
    const content = JSON.stringify(data, null, 2);

    let sha: string | undefined;
    try {
      const existingFile = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });
      if (!Array.isArray(existingFile.data)) {
        sha = existingFile.data.sha;
      }
    } catch (error) {
      // File doesn't exist, sha remains undefined
    }

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha,
    });
  }
}
