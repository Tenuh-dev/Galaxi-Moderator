"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const autoMod_js_1 = require("../handlers/autoMod.js");
const botStatus_js_1 = require("../handlers/botStatus.js");
exports.name = discord_js_1.Events.MessageCreate;
exports.once = false;
async function execute(message) {
    if (message.author.bot)
        return;
    if (!message.guild)
        return;
    const content = message.content.toLowerCase().trim();
    // Fitur: keyword "bot" atau "status bot"
    if (content === 'bot' || content === 'status bot' || content === '!bot' || content === '!status bot') {
        await (0, botStatus_js_1.handleBotStatusCommand)(message);
        return;
    }
    // Jalankan auto moderasi
    await (0, autoMod_js_1.runAutoMod)(message);
}
//# sourceMappingURL=messageCreate.js.map