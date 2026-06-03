require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ───────────────── DATABASE
const levels = new Map();
const coins = new Map();
const daily = new Map();
const inventory = new Map();

// ───────────────── XP SYSTEM FIXED
function addXP(id, xp) {
  let data = levels.get(id) || { xp: 0, level: 1 };

  data.xp += xp;

  if (data.xp >= 100) {
    data.level++;
    data.xp = data.xp - 100;
  }

  levels.set(id, data);
}

// ───────────────── DATA
const ranks = [
  "Iron","Bronze","Silver","Gold",
  "Platinum","Diamond","Ascendant",
  "Immortal","Radiant"
];

const quotes = [
  "૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა you are soft like clouds ☁️",
  "💗 everything feels better with you",
  "🌸 stay gentle, the world needs you",
  "🧸 you are someone’s favorite person",
  "✨ small things, big happiness"
];

const valorankGifs = [
  "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
  "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
  "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
  "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
  "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif"
];

// ───────────────── SHOP FIXED
const shop = [
  { id:"1", name:"💙 cinnabun", cost:2000, roleId:"1511821810755440710", icon:"💙", desc:"top tier bun" },
  { id:"2", name:"💗 melbun", cost:1200, roleId:"1511821591862972647", icon:"💗", desc:"pink bun" },
  { id:"3", name:"🖤 kurobun", cost:700, roleId:"1511825903338913952", icon:"🖤", desc:"dark bun" },
  { id:"4", name:"🍞 pompombun", cost:400, roleId:"1511826069836140754", icon:"🍞", desc:"cozy bun" },
  { id:"5", name:"🌻 pochabun", cost:200, roleId:"1511822052066197665", icon:"🌻", desc:"starter bun" }
];

// ───────────────── EMBED FIXED
function embed(user, title, desc) {
  return new EmbedBuilder()
    .setAuthor({ name:`BunBun ✦ ${user.username}`, iconURL:user.displayAvatarURL() })
    .setTitle(title)
    .setDescription(`╭── 💗 BunBun Premium ──╮\n${desc}\n╰────────────────────╯`)
    .setColor(0xffc0cb)
    .setTimestamp();
}

// ───────────────── SLASH COMMANDS FIXED
const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Show all commands"),
  new SlashCommandBuilder().setName("daily").setDescription("Get daily coins"),
  new SlashCommandBuilder().setName("balance").setDescription("Check coins"),
  new SlashCommandBuilder().setName("profile").setDescription("View profile"),
  new SlashCommandBuilder().setName("shop").setDescription("View shop"),
  new SlashCommandBuilder().setName("buy").setDescription("Buy role")
    .addStringOption(o => o.setName("id").setDescription("Item ID").setRequired(true)),
  new SlashCommandBuilder().setName("inventory").setDescription("Inventory"),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Top coins"),
  new SlashCommandBuilder().setName("valorank").setDescription("Random rank"),
  new SlashCommandBuilder().setName("aesthetic").setDescription("Cute quotes"),
  new SlashCommandBuilder().setName("ship").setDescription("Ship user")
    .addUserOption(o => o.setName("user").setDescription("target").setRequired(true)),
  new SlashCommandBuilder().setName("love").setDescription("Love message")
    .addUserOption(o => o.setName("user").setDescription("target").setRequired(true))
].map(c => c.toJSON());

// ───────────────── REGISTER
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log("💗 BunBun PREMIUM ONLINE FIXED");
});

// ───────────────── MESSAGE SYSTEM
client.on("messageCreate", msg => {
  if (msg.author.bot) return;

  addXP(msg.author.id, 5);
  coins.set(msg.author.id, (coins.get(msg.author.id) || 0) + Math.floor(Math.random() * 5) + 1);
});

// ───────────────── INTERACTION (FULL FIXED)
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user;
  const cmd = interaction.commandName;

  // ───── HELP
  if (cmd === "help") {
    return interaction.reply({
      embeds:[embed(user,"💗 Help",
`/daily /balance /profile /shop /buy /inventory
/leaderboard /valorank /aesthetic /ship /love`)]
    });
  }

  // ───── DAILY FIXED
  if (cmd === "daily") {
    if (daily.get(user.id) && Date.now() - daily.get(user.id) < 86400000)
      return interaction.reply({ content:"⏳ Already claimed today", ephemeral:true });

    const reward = Math.floor(Math.random()*300)+200;
    coins.set(user.id,(coins.get(user.id)||0)+reward);
    daily.set(user.id,Date.now());

    return interaction.reply({ embeds:[embed(user,"🎁 Daily",`+${reward} coins`)]});
  }

  // ───── BALANCE
  if (cmd === "balance") {
    return interaction.reply({ embeds:[embed(user,"💰 Balance",`${coins.get(user.id)||0}`)]});
  }

  // ───── PROFILE FIXED
  if (cmd === "profile") {
    const lvl = levels.get(user.id)||{xp:0,level:1};
    return interaction.reply({
      embeds:[embed(user,"🌸 Profile",
`Level: ${lvl.level}
XP: ${lvl.xp}/100
Coins: ${coins.get(user.id)||0}`)]
    });
  }

  // ───── SHOP FIXED
  if (cmd === "shop") {
    const list = shop.map(i =>
`╭ ${i.icon} ${i.name}
│ ${i.desc}
│ 💰 ${i.cost}
│ ID: ${i.id}
╰────────`).join("\n");

    return interaction.reply({ embeds:[embed(user,"🛍️ Shop",list)]});
  }

  // ───── BUY FIXED SAFE
  if (cmd === "buy") {
    const id = interaction.options.getString("id");
    const item = shop.find(x => x.id === id);

    if (!item)
      return interaction.reply({ content:"Invalid item", ephemeral:true });

    const money = coins.get(user.id) || 0;

    if (money < item.cost)
      return interaction.reply({ content:"Not enough coins", ephemeral:true });

    const role = interaction.guild.roles.cache.get(item.roleId);

    if (!role)
      return interaction.reply({ content:"Role not found in server", ephemeral:true });

    coins.set(user.id, money - item.cost);

    await interaction.member.roles.add(role);

    const inv = inventory.get(user.id) || [];
    inv.push(id);
    inventory.set(user.id, inv);

    return interaction.reply({ embeds:[embed(user,"💗 Success",`Bought ${item.name}`)]});
  }

  // ───── INVENTORY FIXED
  if (cmd === "inventory") {
    const inv = inventory.get(user.id) || [];
    const items = shop
      .filter(x => inv.includes(x.id))
      .map(x => x.name)
      .join("\n") || "Empty";

    return interaction.reply({ embeds:[embed(user,"🎒 Inventory",items)]});
  }

  // ───── LEADERBOARD FIXED
  if (cmd === "leaderboard") {
    const top = [...coins.entries()]
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5)
      .map((x,i)=>`${i+1}. <@${x[0]}> - ${x[1]}`);

    return interaction.reply({ embeds:[embed(user,"🏆 Top Coins",top.join("\n"))]});
  }

  // ───── VALORANK FIXED (WORKING)
  if (cmd === "valorank") {
    const rank = ranks[Math.floor(Math.random()*ranks.length)];
    const percent = Math.floor(Math.random()*100)+1;
    const gif = valorankGifs[Math.floor(Math.random()*valorankGifs.length)];

    return interaction.reply({
      embeds:[
        new EmbedBuilder()
          .setTitle("🎮 Valorank")
          .setDescription(`💗 Rank: **${rank}**\n✨ Skill: **${percent}%**`)
          .setImage(gif)
          .setColor(0xffc0cb)
      ]
    });
  }

  // ───── AESTHETIC
  if (cmd === "aesthetic") {
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    return interaction.reply({ embeds:[embed(user,"🫧 Quote",q)]});
  }

  // ───── SHIP
  if (cmd === "ship") {
    const t = interaction.options.getUser("user");
    return interaction.reply({ content:`💞 ${user.username} × ${t.username}`});
  }

  // ───── LOVE
  if (cmd === "love") {
    const t = interaction.options.getUser("user");
    return interaction.reply({ content:`💖 ${user.username} loves ${t.username}`});
  }
});

// ───────────────── LOGIN
client.login(process.env.TOKEN);