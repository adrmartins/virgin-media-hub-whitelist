# virgin-media-hub-whitelist

This is a NodeJS service to create a network whitelist for the Virgin Media Hub 3 broadband router.

The service creates a cron job which is responsible to check if the hosts are allowed to access the internet based on a CSV file called [whitelist.csv](./data/whitelist.csv).



## Getting started


```bash
docker volume create virgin-media-hub-whitelist
docker compose up -d

```
