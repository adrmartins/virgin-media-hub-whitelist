import fs from "fs";
import { parse } from "csv-parse";
import { RouterController } from "./routerController.js";
import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import dns from "dns";
//
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") config();
//

const scheduler = new ToadScheduler();

const task = new Task("Whitelist router sync", exec);
const job = new SimpleIntervalJob({ seconds: process.env.SYNC_INTERVAL }, task);

scheduler.addSimpleIntervalJob(job);

async function exec() {
  const isOnline = await testConnection();

  if (!isOnline) {
    console.log(`\nNo connection - ${new Date()}`);
    return;
  }

  const whitelist = [];

  fs.createReadStream("./data/whitelist.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", (row) => {
      whitelist.push(row[1]);
    })
    .on("end", () => {
      syncWhitelist(whitelist);
    });

  return whitelist;
}

exec();

async function syncWhitelist(whitelist) {
  console.log(`\nStarting sync - ${new Date()}`);

  const startedTime = performance.now();

  const router = new RouterController();

  await router.connect();

  const hosts = await router.getHosts();

  const macFilters = await router.getMacFilters();

  for await (const host of hosts) {
    host.macAddress = host.macAddress.toUpperCase();

    const isBlocked = macFilters.some(
      (macFilter) =>
        macFilter.macAddress === host.macAddress && macFilter.filter.enable
    );

    const isAllowed = whitelist.includes(host.macAddress);

    if (!isAllowed && !isBlocked) {
      await router.createFilter(host.macAddress, host.config.hostname);
    } else if (isAllowed && isBlocked) {
      await router.removeFilter(host.macAddress);
    }
  }

  await router.disconnect();

  const executionTime = Math.round((performance.now() - startedTime) / 1000);

  console.log(`Sync finished in ${executionTime} seconds`);
}

async function testConnection() {
  return new Promise((resolve, reject) => {
    dns.resolve("www.google.com", (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}
