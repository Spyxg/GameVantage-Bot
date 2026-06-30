require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const commands = [

    new SlashCommandBuilder()
        .setName("status-operational")
        .setDescription("Set a product to Operational")
        .addStringOption(option =>
            option
                .setName("product")
                .setDescription("Select product")
                .setRequired(true)
                .addChoices(
                    { name: "BO7: FULL", value: "BO7: FULL" },
                    { name: "SCUM: FULL", value: "SCUM: FULL" },
                    { name: "DAYZ: FULL", value: "DAYZ: FULL" },
                    { name: "EFT: FULL", value: "EFT: FULL" },
                    { name: "EFT: LITE", value: "EFT: LITE" },
                    { name: "WAR THUNDER: FULL", value: "WAR THUNDER: FULL" },
                    { name: "ARK: FULL", value: "ARK: FULL" }
                )
        ),

    new SlashCommandBuilder()
        .setName("status-updating")
        .setDescription("Set a product to Updating")
        .addStringOption(option =>
            option
                .setName("product")
                .setDescription("Select product")
                .setRequired(true)
                .addChoices(
                    { name: "BO7: FULL", value: "BO7: FULL" },
                    { name: "SCUM: FULL", value: "SCUM: FULL" },
                    { name: "DAYZ: FULL", value: "DAYZ: FULL" },
                    { name: "EFT: FULL", value: "EFT: FULL" },
                    { name: "EFT: LITE", value: "EFT: LITE" },
                    { name: "WAR THUNDER: FULL", value: "WAR THUNDER: FULL" },
                    { name: "ARK: FULL", value: "ARK: FULL" }
                )
        )

].map(command => command.toJSON());

const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

(async () => {

    try {

        console.log("Registering commands...");

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body: commands
            }
        );

        console.log("Commands registered.");

    } catch (error) {
        console.error(error);
    }

})();