require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

// ───────────────── ꒰ა BUNBUN CORE ໒꒱
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ───────────────── soft safety
process.on("unhandledRejection", () => {});
process.on("uncaughtException", () => {});

// ───────────────── pastel memory
const levels = new Map();
const coins = new Map();
const daily = new Map();
const inventory = new Map();
const pity = new Map();
const streak = new Map();

// ───────────────── ✦ XP FLOW
function addXP(id, xp) {
  let d = levels.get(id) || { xp: 0, level: 1 };
  d.xp += xp;
  if (d.xp >= 100) {
    d.level++;
    d.xp -= 100;
  }
  levels.set(id, d);
}

// ───────────────── ♡ aesthetic UI
const ui = {
  shop: "https://i.pinimg.com/originals/2a/7c/8f/2a7c8f1a0b9c4d6e8f1234567890abcd.gif",
  profile: "https://i.pinimg.com/originals/7b/9c/1d/7b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e.gif",
  daily: "https://i.pinimg.com/originals/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.gif",
  valorank: "https://i.pinimg.com/originals/cc/aa/11/ccaa11223344556677889900aabbccdd.gif",
  gacha: "https://i.pinimg.com/originals/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.gif"
};

// ───────────────── ♡ ranks
const ranks = ["Iron","Bronze","Silver","Gold","Platinum","Diamond","Ascendant","Immortal","Radiant"];

// ───────────────── ˚₊‧ quotes
const quotes = [
  "💗 soft hearts never break, they bloom instead",
  "🎀 you are made of gentle stardust",
  "🫧 even silence can be pink",
  "🌸 the world resets in pastel",
  "💞 BunBun is quietly proud of you"
];

// ───────────────── ꒰ა coquette shop ໒꒱
const shop = [
  { id:"1", name:"💙 cinnabun", cost:2000, roleId:"1511821810755440710", icon:"💙", desc:"soft royal tier" },
  { id:"2", name:"💗 melbun", cost:1200, roleId:"1511821591862972647", icon:"💗", desc:"sweet pastel tier" },
  { id:"3", name:"🖤 kurobun", cost:700, roleId:"1511825903338913952", icon:"🖤", desc:"night velvet tier" },
  { id:"4", name:"🍞 pompombun", cost:400, roleId:"1511826069836140754", icon:"🍞", desc:"warm cozy tier" },
  { id:"5", name:"🌻 pochabun", cost:200, roleId:"1511822052066197665", icon:"🌻", desc:"soft starter tier" }
];

// ───────────────── ♡ embed aesthetic core
function embed(user, title, desc, image) {
  return new EmbedBuilder()
    .setAuthor({
      name: `꒰ა BunBun.exe ໒꒱`,
      iconURL: user.displayAvatarURL()
    })
    .setTitle(`✦ ${title}`)
    .setDescription(
      `˚₊‧꒰ა system whisper ໒꒱‧₊˚\n\n${desc}\n\n✦ soft pastel engine running...`
    )
    .setColor(0xffc0cb)
    .setImage(image || null)
    .setFooter({ text: "꒰ა gentle system flow ໒꒱" })
    .setTimestamp();
}

// ───────────────── ✦ slash commands
const commands = [
  new SlashCommandBuilder().setName("help").setDescription("soft guide"),
  new SlashCommandBuilder().setName("daily").setDescription("gentle reward"),
  new SlashCommandBuilder().setName("balance").setDescription("your coins"),
  new SlashCommandBuilder().setName("profile").setDescription("your aura"),
  new SlashCommandBuilder().setName("shop").setDescription("pastel shop"),

  new SlashCommandBuilder()
    .setName("buy")
    .setDescription("adopt a role")
    .addStringOption(o =>
      o.setName("id").setDescription("item id").setRequired(true)
    ),

  new SlashCommandBuilder().setName("inventory").setDescription("your collection"),
  new SlashCommandBuilder().setName("leaderboard").setDescription("soft ranking"),
  new SlashCommandBuilder().setName("valorank").setDescription("aura reading"),
  new SlashCommandBuilder().setName("aesthetic").setDescription("gentle quote"),

  new SlashCommandBuilder()
    .setName("ship")
    .setDescription("two souls")
    .addUserOption(o =>
      o.setName("user").setDescription("other soul").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("love")
    .setDescription("soft feelings")
    .addUserOption(o =>
      o.setName("user").setDescription("target").setRequired(true)
    ),

  new SlashCommandBuilder().setName("gacha").setDescription("fate pull")
].map(c => c.toJSON());

// ───────────────── register
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log("💗 BunBun.exe soft pastel core online");
});

// ───────────────── xp loop
client.on("messageCreate", msg => {
  if (msg.author.bot) return;
  addXP(msg.author.id, 5);
  coins.set(msg.author.id, (coins.get(msg.author.id) || 0) + Math.floor(Math.random() * 3) + 1);
});

// ───────────────── interaction core
client.on("interactionCreate", async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const user = interaction.user;
    const cmd = interaction.commandName;

    // ───── help
    if (cmd === "help") {
      return interaction.reply({
        embeds: [embed(user, "✦ help corner", "/daily /balance /profile /shop /buy /gacha", ui.shop)]
      });
    }

    // ───── daily
    if (cmd === "daily") {
      const last = daily.get(user.id) || 0;
      if (Date.now() - last < 86400000)
        return interaction.reply({ content: "˚₊‧ cooldown resting...", ephemeral: true });

      const reward = Math.floor(Math.random() * 60) + 10;

      coins.set(user.id, (coins.get(user.id) || 0) + reward);
      daily.set(user.id, Date.now());

      return interaction.reply({
        embeds: [embed(user, "✦ daily blessing", `+${reward} coins ˚₊‧`, ui.daily)]
      });
    }

    // ───── balance
    if (cmd === "balance") {
      return interaction.reply({
        embeds: [embed(user, "✦ wallet", `${coins.get(user.id) || 0} coins`)]
      });
    }

    // ───── profile
    if (cmd === "profile") {
      const lvl = levels.get(user.id) || { xp: 0, level: 1 };
      return interaction.reply({
        embeds: [embed(user, "✦ profile aura", `level ${lvl.level}\nxp ${lvl.xp}/100`, ui.profile)]
      });
    }

    // ───── shop (with role mention FIXED)
    if (cmd === "shop") {
      const list = shop.map(i =>
`✦ ${i.icon} ${i.name}
┊ ${i.desc}
┊ cost: ${i.cost}
┊ role: <@&${i.roleId}>
┊ id: ${i.id}
`).join("\n");

      return interaction.reply({
        embeds: [embed(user, "✦ coquette shop", list, ui.shop)]
      });
    }

    // ───── buy
    if (cmd === "buy") {
      const id = interaction.options.getString("id");
      const item = shop.find(x => x.id === id);
      if (!item) return interaction.reply({ content: "˚₊‧ invalid item", ephemeral: true });

      const money = coins.get(user.id) || 0;
      if (money < item.cost)
        return interaction.reply({ content: "˚₊‧ not enough coins", ephemeral: true });

      const role = interaction.guild.roles.cache.get(item.roleId);
      if (role) await interaction.member.roles.add(role);

      coins.set(user.id, money - item.cost);

      const inv = inventory.get(user.id) || [];
      inv.push(id);
      inventory.set(user.id, inv);

      return interaction.reply({
        embeds: [embed(user, "✦ adopted", item.name)]
      });
    }

    // ───── inventory
    if (cmd === "inventory") {
      const inv = inventory.get(user.id) || [];
      const items = shop.filter(x => inv.includes(x.id)).map(x => x.name).join("\n") || "empty";

      return interaction.reply({
        embeds: [embed(user, "✦ collection", items)]
      });
    }

    // ───── leaderboard
    if (cmd === "leaderboard") {
      const top = [...coins.entries()]
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5)
        .map((x,i)=>`✦ ${i+1}. <@${x[0]}> — ${x[1]} coins`);

      return interaction.reply({
        embeds: [embed(user, "✦ soft ranking", top.join("\n"))]
      });
    }

    // ───── valorank
    if (cmd === "valorank") {
      const rank = ranks[Math.floor(Math.random()*ranks.length)];
      const percent = Math.floor(Math.random()*100)+1;

      return interaction.reply({
        embeds: [embed(user, "✦ aura reading", `rank: ${rank}\nenergy: ${percent}%`, ui.valorank)]
      });
    }

    // ───── quote
    if (cmd === "aesthetic") {
      return interaction.reply({
        embeds: [embed(user, "✦ soft whisper", quotes[Math.floor(Math.random()*quotes.length)])]
      });
    }

    // ───── ship
    if (cmd === "ship") {
      const t = interaction.options.getUser("user");
      return interaction.reply({ content: `💞 ✦ ${user.username} × ${t.username}` });
    }

    // ───── love
    if (cmd === "love") {
      const t = interaction.options.getUser("user");
      return interaction.reply({ content: `💗 ✦ ${user.username} loves ${t.username}` });
    }

    // ───── gacha
    if (cmd === "gacha") {
      let p = pity.get(user.id) || 0;
      p++;

      let result;

      if (Math.random() < 0.05 || p >= 10) {
        result = "LEGENDARY ✦";
        p = 0;

        const inv = inventory.get(user.id) || [];
        inv.push("LEGENDARY ✦");
        inventory.set(user.id, inv);
      } else {
        const gain = Math.floor(Math.random()*100)+20;
        coins.set(user.id, (coins.get(user.id)||0)+gain);
        result = `${gain} coins`;
      }

      pity.set(user.id, p);

      return interaction.reply({
        embeds: [embed(user, "✦ fate pull", `you got: ${result}`, ui.gacha)]
      });
    }

  } catch (e) {
    return interaction.reply({ content: "˚₊‧ system blur...", ephemeral: true }).catch(()=>{});
  }
});

// ───────────────── login
client.login(process.env.TOKEN);