import cron from 'node-cron';
import { OctokitClient } from './octokit';
import { AutomatedData, GardenData } from './interfaces';


async function main(): Promise<void> {

   const cronSchedule = '0 0 * * *';
   const fileIn = {
      branch: 'V3',
      owner: 'lxrbckl-dev',
      repo: 'Project-SelfStack',
      path: 'data/automated.json'
   };
   const fileOut = {
      branch: 'V2',
      owner: 'lxrbckl-dev',
      repo: 'Project-MadGarden',
      path: 'data/automated.json',
      commitMessage: 'Project MadGarden - Automated Data Collection'
   };

   const client = new OctokitClient("");

   async function updateGarden(): Promise<void> {
      try {
         // READ DATA - Fetches repository metadata from the source file.
         console.log(`Reading from ${fileIn.owner}/${fileIn.repo}/${fileIn.path}...`);
         const { repositories } = await client.readFileContents<AutomatedData>(
            fileIn.owner,
            fileIn.repo,
            fileIn.path,
            fileIn.branch
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
         console.log(`Writing to ${fileOut.owner}/${fileOut.repo}/${fileOut.path}...`);
         await client.writeFileContents(
            fileOut.owner,
            fileOut.repo,
            fileOut.path,
            garden,
            fileOut.branch,
            fileOut.commitMessage
         );
         console.log('Garden updated successfully');
      } catch (error) {
         console.error(error);
      }
   }

   await updateGarden();
   cron.schedule(cronSchedule, async () => {
      await updateGarden();
   });

}


main();
