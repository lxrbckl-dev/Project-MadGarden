import cron from 'node-cron';
import { OctokitClient } from './octokit';
import { AutomatedData, GardenData } from './interfaces';


async function main(): Promise<void> {

   const cronSchedule = '0 * * * *';

   const inConfig = {
      branch: 'V3',
      owner: 'lxrbckl-dev',
      repo: 'Project-SelfStack',
      path: 'data/automated.json'
   };

   const outConfig = {
      branch: 'V3',
      owner: 'lxrbckl-dev',
      repo: 'Project-SelfStack',
      path: 'data/garden.json',
      commitMessage: 'Update garden'
   };

   const client = new OctokitClient("");

   async function updateGarden(): Promise<void> {

      // READ DATA - Fetches repository metadata from the source file.
      console.log(`Reading from ${inConfig.owner}/${inConfig.repo}/${inConfig.path}...`);
      const { repositories } = await client.readFileContents<AutomatedData>(
         inConfig.owner,
         inConfig.repo,
         inConfig.path,
         inConfig.branch
      );
      console.log(`Loaded ${Object.keys(repositories).length} repositories`);


      // BUILD GARDEN - Transforms repository data into an index grouped by technology.
      const garden: GardenData = {};
      for (const repository of Object.values(repositories)) {
         for (const stackElement of repository.stack) {
            if (!garden[stackElement]) {
               garden[stackElement] = [];
            }
            garden[stackElement].push({
               projectName: repository.title,
               projectLink: repository.url
            });
         }
      }
      console.log(`Indexed ${Object.keys(garden).length} technologies`);

      // WRITE TO FILE - Commits the transformed garden data to the destination repository.
      console.log(`Writing to ${outConfig.owner}/${outConfig.repo}/${outConfig.path}...`);
      await client.writeFileContents(
         outConfig.owner,
         outConfig.repo,
         outConfig.path,
         garden,
         outConfig.branch,
         outConfig.commitMessage
      );
      console.log('Garden updated successfully');

   }

   await updateGarden();
   cron.schedule(cronSchedule, async () => {
      await updateGarden();
   });

}


main();
