const db = require("./database/database");
const fs = require("fs");
require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    SlashCommandBuilder,
    REST,
    Routes
} = require("discord.js");

const axios = require("axios");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const ALLOWED_PRODUCTS = [
"Apex Legends External",
"ARC Raiders External",
"Arena Breakout Infinite Internal",
"Delta Force Internal",
"Fortnite External",
"Rainbow Six Full Internal",
"Rainbow Six Lite Internal",
"Rust External",
"Valorant External"
];

const PRODUCT_NAME_MAP = {
"Apex Legends External": "APEX LEGENDS: FULL",
"ARC Raiders External": "ARC RAIDERS: FULL",
"Arena Breakout Infinite Internal": "ABI: FULL",
"Delta Force Internal": "DELTA FORCE: FULL",
"Fortnite External": "FORTNITE: FULL",
"Rainbow Six Full Internal": "R6: FULL",
"Rainbow Six Lite Internal": "R6: LITE",
"Rust External": "RUST: FULL",
"Valorant External": "VALORANT: FULL"
};

const MANUAL_PRODUCT_LIST = [
    "BO7: FULL",
    "SCUM: FULL",
    "DAYZ: FULL",
    "EFT: FULL",
    "EFT: LITE",
    "WAR THUNDER: FULL",
    "ARK: FULL"
];

let statusMessage = null;

function saveManualProducts(data) {

    fs.writeFileSync(
        "./manualProducts.json",
        JSON.stringify(data, null, 2)
    );

}

function loadManualProducts() {
return JSON.parse(
fs.readFileSync("./manualProducts.json", "utf8")
);
}

function saveManualProducts(data) {

    fs.writeFileSync(
        "./manualProducts.json",
        JSON.stringify(data, null, 2)
    );

}

async function getProducts() {
const response = await axios.get(
"https://api.battleye.dev/v1/products",
{
headers: {
Authorization: `Bearer ${process.env.BATTLEYE_API_KEY}`
}
}
);


return response.data.data.products;


}

function buildStatusEmbed(products) {


const operational = [];
const updating = [];

const manualProducts = loadManualProducts();

products = products.filter(product =>
    ALLOWED_PRODUCTS.includes(product.product_name)
);

for (const product of products) {

    const name =
        PRODUCT_NAME_MAP[product.product_name] ||
        product.product_name;

    if (
        product.status === "undetected" &&
        product.purchase_available &&
        !product.frozen
    ) {
        operational.push(`✅ ${name}`);
    } else {
        updating.push(`🔄 ${name}`);
    }
}

for (const [name, status] of Object.entries(manualProducts)) {

    if (status === "operational") {
        operational.push(`✅ ${name}`);
    } else {
        updating.push(`🔄 ${name}`);
    }
}

const description = `
━━━━━━━━━━━━━━━━━━━━━━
🟢 **OPERATIONAL (${operational.length})**
━━━━━━━━━━━━━━━━━━━━━━

${operational.join("\n")}

━━━━━━━━━━━━━━━━━━━━━━
🔄 **UPDATING (${updating.length})**
━━━━━━━━━━━━━━━━━━━━━━

${updating.length ? updating.join("\n") : "None"}
`;

return new EmbedBuilder()
    .setTitle("📊 Live Product Status")
    .setDescription(description)
    .setColor("#7c3aed")
    .setImage("https://i.imgur.com/PaFgNzQ.gif")
    .setFooter({
    text: `Last Updated ${new Date().toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit"
    })} CT • Auto Refresh Every 5m • GameVantage`
})


}

async function updateStatusChannel() {


try {

    const channel = await client.channels.fetch(
        process.env.STATUS_CHANNEL_ID
    );

    const products = await getProducts();

    const embed = buildStatusEmbed(products);

    if (!statusMessage) {

        const messages = await channel.messages.fetch({
            limit: 50
        });

        statusMessage = messages.find(
            message =>
                message.author.id === client.user.id &&
                message.embeds.length > 0
        );
    }

    if (!statusMessage) {

        statusMessage = await channel.send({
            embeds: [embed]
        });

        console.log("Created status board");

    } else {

        await statusMessage.edit({
            embeds: [embed]
        });

        console.log("Updated status board");
    }

} catch (error) {

    console.error("Status Update Failed");

    if (error.response) {
        console.error(error.response.data);
    } else {
        console.error(error.message);
    }
}


}

client.once("clientReady", async () => {


console.log(`Logged in as ${client.user.tag}`);

await updateStatusChannel();

setInterval(updateStatusChannel, 300000);


});

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (!interaction.memberPermissions.has("Administrator")) {

        return interaction.reply({
            content: "❌ Administrator only.",
            ephemeral: true
        });

    }

    const product =
        interaction.options.getString("product");

    const data = loadManualProducts();

    if (interaction.commandName === "status-operational") {

        data[product] = "operational";

        saveManualProducts(data);

        await updateStatusChannel();

        return interaction.reply({
            content: `✅ ${product} set to Operational`,
            ephemeral: true
        });

    }

    if (interaction.commandName === "status-updating") {

        data[product] = "updating";

        saveManualProducts(data);

        await updateStatusChannel();

        return interaction.reply({
            content: `🔄 ${product} set to Updating`,
            ephemeral: true
        });

    }

});

client.login(process.env.DISCORD_TOKEN);
