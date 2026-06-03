require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
const cooldown = new Map();

// ───────────────── LEVEL SYSTEM
function addXP(userId, xp) {
  const data = levels.get(userId) || { xp: 0, level: 1 };
  data.xp += xp;

  if (data.xp >= 100) {
    data.level++;
    data.xp = 0;
  }

  levels.set(userId, data);
  return data;
}

// ───────────────── RANK DATA
const ranks = [
  "Iron","Bronze","Silver","Gold",
  "Platinum","Diamond","Ascendant",
  "Immortal","Radiant"
];

// ───────────────── SHOP
const shop = [
  { id:"1", name:"🍡 cinnabun", desc:"highest tier", cost:2000, roleId:"1511821810755440710", icon:"🍡" },
  { id:"2", name:"🍧 melbun", desc:"pink tier", cost:1200, roleId:"1511821591862972647", icon:"🍧" },
  { id:"3", name:"🍙 kurobun", desc:"mid tier", cost:700, roleId:"1511825903338913952", icon:"🍙" },
  { id:"4", name:"🍮 pompombun", desc:"cozy tier", cost:400, roleId:"1511826069836140754", icon:"🍮" },
  { id:"5", name:"🍯 pochabun", desc:"starter tier", cost:200, roleId:"1511822052066197665", icon:"🍯" }
];

// ───────────────── EMBED
function embed(user, title, desc) {
  return new EmbedBuilder()
    .setAuthor({ name:`BunBun ✦ ${user.username}`, iconURL:user.displayAvatarURL() })
    .setTitle(title)
    .setDescription(desc)
    .setColor(0xffc0cb)
    .setTimestamp();
}

// ───────────────── COMMANDS
const commands = [
  "help","daily","balance","profile","shop","buy","inventory",
  "valorank","aesthetic","ship","love","leaderboard"
].map(name => new SlashCommandBuilder().setName(name).setDescription(name).toJSON());

// ───────────────── REGISTER
const rest = new REST({ version:"10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  await rest.put(Routes.applicationCommands(client.user.id), { body:commands });
  console.log("💗 BunBun upgraded online");
});

// ───────────────── MESSAGE ECONOMY + XP
client.on("messageCreate", msg => {
  if (msg.author.bot) return;

  addXP(msg.author.id, 5);
  coins.set(msg.author.id, (coins.get(msg.author.id) || 0) + Math.floor(Math.random()*5)+1);
});

// ───────────────── INTERACTION
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user;
  const cmd = interaction.commandName;

  // ───── HELP
  if (cmd === "help") {
    return interaction.reply({
      embeds:[embed(user,"💗 Commands",
`/daily /balance /profile /shop /buy /inventory
/valorank /aesthetic /ship /love /leaderboard`)
    ]});
  }

  // ───── DAILY
  if (cmd === "daily") {
    const last = daily.get(user.id);
    if (last && Date.now()-last < 86400000)
      return interaction.reply({ content:"⏳ Already claimed", ephemeral:true });

    const bonus = Math.floor(Math.random()*300)+200;
    coins.set(user.id,(coins.get(user.id)||0)+bonus);
    daily.set(user.id,Date.now());

    return interaction.reply({ embeds:[embed(user,"🎁 Daily",`+${bonus} coins`)]});
  }

  // ───── BALANCE
  if (cmd === "balance") {
    return interaction.reply({ embeds:[embed(user,"💰 Balance",`${coins.get(user.id)||0} coins`)]});
  }

  // ───── PROFILE
  if (cmd === "profile") {
    const lvl = levels.get(user.id)||{xp:0,level:1};
    return interaction.reply({
      embeds:[embed(user,"🌸 Profile",
`Level: ${lvl.level}
XP: ${lvl.xp}/100
Coins: ${coins.get(user.id)||0}`)]
    });
  }

  // ───── SHOP (✔️ UPDATED ROLE MENTION)
  if (cmd === "shop") {
    const list = shop.map(i =>
`╭ ${i.icon} ${i.name}
│ 🪄 ${i.desc}
│ 💰 ${i.cost} coins
│ 🆔 ${i.id}
│ 🏷️ Role: <@&${i.roleId}>
╰──────────────`
    ).join("\n\n");

    return interaction.reply({
      embeds:[embed(user,"🛍️ Shop",list)]
    });
  }

  // ───── BUY (BUTTON CONFIRM)
  if (cmd === "buy") {
    const id = interaction.options.getString("id");
    const item = shop.find(x=>x.id===id);
    if(!item) return interaction.reply({content:"Invalid",ephemeral:true});

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_${id}`)
        .setLabel("Confirm Buy")
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({content:"Confirm purchase?",components:[row],ephemeral:true});
  }

  // ───── INVENTORY
  if (cmd === "inventory") {
    const inv = inventory.get(user.id)||[];
    const items = shop.filter(x=>inv.includes(x.id)).map(i=>i.name).join("\n")||"Empty";
    return interaction.reply({ embeds:[embed(user,"🎒 Inventory",items)]});
  }

  // ───── LEADERBOARD
  if (cmd === "leaderboard") {
    const top = [...coins.entries()]
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5)
      .map((x,i)=>`${i+1}. <@${x[0]}> - ${x[1]}`);

    return interaction.reply({ embeds:[embed(user,"🏆 Top Coins",top.join("\n"))]});
  }

  // ───── OTHER
  if (cmd === "aesthetic") return interaction.reply({embeds:[embed(user,"🫧 Quote","soft vibes")]});
  if (cmd === "ship") return interaction.reply({content:"💞 ship done"});
  if (cmd === "love") return interaction.reply({content:"💖 love sent"});
});

// ───── BUTTON HANDLER
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  if(i.customId.startsWith("confirm_")){
    const id=i.customId.split("_")[1];
    const item=shop.find(x=>x.id===id);

    const money=coins.get(i.user.id)||0;
    if(money<item.cost)
      return i.reply({content:"Not enough coins",ephemeral:true});

    coins.set(i.user.id,money-item.cost);

    const inv=inventory.get(i.user.id)||[];
    inv.push(id);
    inventory.set(i.user.id,inv);

    return i.reply({content:`Purchased ${item.name}`,ephemeral:true});
  }
});

// ───── LOGIN
client.login(process.env.TOKEN);