import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, "src", "data");

if (!fs.existsSync(sourceDir)) {
  fs.mkdirSync(sourceDir, { recursive: true });
}

const itemsPath = path.join(sourceDir, "items.json");
const items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));

const botsPath = path.join(sourceDir, "bots.json");
const bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

const botIcons = {
  the_queen: "https://cdn.metaforge.app/arc-raiders/icons/queen.webp",
  fireball: "https://cdn.metaforge.app/arc-raiders/icons/fireball.webp",
  hornet: "https://cdn.metaforge.app/arc-raiders/icons/hornet.webp",
  wasp: "https://cdn.metaforge.app/arc-raiders/icons/wasp.webp",
  tick: "https://cdn.metaforge.app/arc-raiders/icons/tick.webp",
  leaper: "https://cdn.metaforge.app/arc-raiders/icons/bison.webp",
  pop: "https://cdn.metaforge.app/arc-raiders/icons/pop.webp",
  rocketeer: "https://cdn.metaforge.app/arc-raiders/icons/rocketeer.webp",
  bastion: "https://cdn.metaforge.app/arc-raiders/icons/bastion.webp",
  bombardier: "https://cdn.metaforge.app/arc-raiders/icons/bombardier.webp",
  sentinel: "https://cdn.metaforge.app/arc-raiders/icons/sentinel.webp",
  snitch: "https://cdn.metaforge.app/arc-raiders/icons/snitch.webp",
  arc_surveyor: "https://cdn.metaforge.app/arc-raiders/icons/rollbot.webp",
  shredder: "https://cdn.metaforge.app/arc-raiders/icons/shredder.webp",
  matriarch: "https://cdn.metaforge.app/arc-raiders/icons/matriarch.webp",
  turret: "https://cdn.metaforge.app/arc-raiders/icons/turret.webp",
  spotter: "https://cdn.metaforge.app/arc-raiders/icons/snitch.webp",
};

const droppedByMap = {};
bots.forEach((bot) => {
  if (bot.drops) {
    bot.drops.forEach((itemId) => {
      if (!droppedByMap[itemId]) {
        droppedByMap[itemId] = [];
      }
      let titleName = "";
      bot.name
        .toLowerCase()
        .split(" ")
        .forEach((word) => {
          titleName += word.charAt(0).toUpperCase() + word.slice(1) + " ";
        });
      titleName = titleName.trim();
      droppedByMap[itemId].push({ id: bot.id, name: titleName, icon: botIcons[bot.id] });
    });
  }
});

const itemLookup = {};
items.forEach((item) => {
  itemLookup[item.id] = item;
});

const recycledFromMap = {};
items.forEach((item) => {
  if (item.recyclesInto) {
    Object.entries(item.recyclesInto).forEach(([recycleId, qty]) => {
      if (!recycledFromMap[recycleId]) {
        recycledFromMap[recycleId] = {};
      }
      recycledFromMap[recycleId][item.id] = qty;
    });
  }
});

const salvagedFromMap = {};
items.forEach((item) => {
  if (item.salvagesInto) {
    Object.entries(item.salvagesInto).forEach(([salvageId, qty]) => {
      if (!salvagedFromMap[salvageId]) {
        salvagedFromMap[salvageId] = {};
      }
      salvagedFromMap[salvageId][item.id] = qty;
    });
  }
});

items.forEach((item) => {
  if (item.recyclesInto) {
    let total = 0;
    Object.entries(item.recyclesInto).forEach(([recycleId, qty]) => {
      const recycleItem = itemLookup[recycleId];
      if (recycleItem && recycleItem.value) {
        total += recycleItem.value * qty;
      }
    });
    item.recycleValue = total;
  } else {
    item.recycleValue = 0;
  }

  if (item.salvagesInto) {
    let total = 0;
    Object.entries(item.salvagesInto).forEach(([salvageId, qty]) => {
      const salvageItem = itemLookup[salvageId];
      if (salvageItem && salvageItem.value) {
        total += salvageItem.value * qty;
      }
    });
    item.salvageValue = total;
  } else {
    item.salvageValue = item.recycleValue || 0;
  }

  item.recycledFrom = recycledFromMap[item.id] || {};
  item.salvagedFrom = salvagedFromMap[item.id] || {};
  item.droppedBy = droppedByMap[item.id] || [];
});

fs.writeFileSync(path.join(sourceDir, "items.json"), JSON.stringify(items, null, 2));

console.log("Prebuild completed successfully");
