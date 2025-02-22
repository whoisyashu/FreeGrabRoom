const { Highrise, Events, Facing, Emotes } = require("highrise.sdk.dev");
const token ="0cece7920d3c0eb0d396db196a62588afc6f1b30a403b116b64435aeb9a5500c";
const room ="67a450dab43004af156376ba";
const bot = new Highrise({
    Events: [
        Events.Messages,
        Events.Joins,
        Events.Emotes,
        Events.Leaves,
        Events.Movements,
        Events.Reactions,
        Events.DirectMessages,
    ],
});

bot.on("ready", () => {
    console.log("Bot is live now.");
    bot.player.teleport(bot.info.user.id, 14.5, 8.25, 17.5, Facing.FrontLeft);
    
});
setInterval(() => {
    bot.message.send("\n🎉 Welcome to the Free Grab Room!🎉\n🔹 Use !join to join the queue.\n🔹 Use !help to see all available commands.\n\n🚀 Enjoy and have fun!");
}, 90000);
bot.on("playerJoin",(user)=>{
    bot.message.send("\n🎉 Welcome to the Free Grab Room! 🎉\n🔹 Use !join to join the queue.\n🔹 Use !help to see all available commands.\n\n🚀 Enjoy and have fun!");
});
bot.on("chatCreate", async (user, message) => {
    const args = message.split(" ");
  
    if (args[0] === "!summon" && args[1].startsWith("@") && moderators.includes(user.username)) {
      const targetUsername = args[1].substring(1); // Remove '@' from username
  
      try {
        // Get target user ID
        const targetId = await bot.room.players.id(targetUsername);
        if (!targetId) {
          return bot.whisper.send(user.id, "User not found.");
        }
  
        // Get the position of the command user
        const userPosition = await bot.room.players.position(user.id);
        if (!userPosition) {
          return bot.whisper.send(user.id, "Could not retrieve your position.");
        }
  
        // Teleport the target user to the command user's location
        await bot.player.teleport(targetId, userPosition.x, userPosition.y, userPosition.z, userPosition.facing);
        bot.whisper.send(user.id, `Successfully summoned ${targetUsername}.`);
        bot.whisper.send(targetId, `You have been summoned by ${user.username}.`);
      } catch (e) {
        console.error(e);
        bot.whisper.send(user.id, "An error occurred while summoning.");
      }
    }
  });

var roomStatus = 1;
const queue = [];
const doneList = new Set(); // Stores players who are marked as "done"

bot.on("chatCreate", async (user, message) => {
  
  if (message === "!join" && roomStatus === 1 ) {
    if (doneList.has(user.id)) {
      bot.message.send(`${user.username}, you have already played and cannot join again.`);
      return;
    }
    if (!queue.includes(user.id)) {
      queue.push(user.id);
      bot.message.send(`${user.username} has joined the queue!`);
    } else {
      bot.message.send(`${user.username}, you are already in the queue!`);
    }
  }else if(message === "!join" && roomStatus === 0){
     bot.message.send("❌The room is closed now, join us later when room is open❌");
  }

  

  if (message === "!queue" && roomStatus === 1) {
    if (queue.length === 0) {
      bot.message.send("The queue is currently empty.");
      return;
    }

    let position = queue.indexOf(user.id) + 1;
    let nextUsers = queue.slice(0, 3); // Get the next 3 users in queue

    try {
      const players = await bot.room.players.get();
      const userMap = new Map(players.map(([playerData]) => [playerData.id, playerData.username]));

      nextUsers = nextUsers.map(id => userMap.get(id) || "Unknown User");

      if (position > 0) {
        bot.message.send(
          `${user.username}, you are at position ${position} in the queue.\n` +
          `Next in queue: ${nextUsers.join("\n")}`
        );
      } else {
        bot.message.send(`You are not in the queue.\nNext in queue: ${nextUsers.join(", ")}`);
      }
    } catch (error) {
      console.error("[ERROR] Failed to fetch player data:", error);
      bot.message.send("An error occurred while retrieving the queue.");
    }
  }else if(message === "!queue" && roomStatus === 0){
    bot.message.send("❌The room is closed now, join us later when room is open❌");
  }
});
const moderators = ["fad3dd","kaishavz","queenbee00420","whoisyash","High_priestess_","msauthentic"]
bot.on("chatCreate", async (user, message) => {
    const args = message.split(" ");
    const command = args[0];

    // Function to teleport a user
    async function teleportUser(username, x, y, z, facing, actionMessage) {
      try {
        const targetUserId = await bot.room.players.id(username);
        await bot.player.teleport(targetUserId, x, y, z, facing);
        bot.message.send(`${username} ${actionMessage} 🚀`);
      } catch (error) {
        console.error(`Error teleporting ${username}:`, error);
        bot.message.send(`Could not find user "${username}".`);
      }
    }
    moderators.includes(user.username)
    if (command === "!vip" && args[1] && moderators.includes(user.username)) {
      const targetUsername = args[1].replace("@", ""); // Remove @ if mentioned
      teleportUser(targetUsername, 15.5, 11, 0, Facing.FrontRight, "has been teleported to the VIP area!");
    } else if (command === "!skip" && args[1]) {
      const targetUsername = args[1].replace("@", ""); // Remove @ if mentioned
      teleportUser(targetUsername, 0.5, 10, 0.5, Facing.FrontRight, "has been skipped!");
    }
    else if (message === "!next 2" && moderators.includes(user.username)) {
        if (user.id === bot.info.owner.id || user.id === "66ce8153010c6659dd76e1d1") {
          if (queue.length === 0) {
            bot.message.send("The queue is empty!");
            return;
          }
    
          const playersToTeleport = queue.splice(0, 2);
          playersToTeleport.forEach((playerId) => {
            bot.player
              .teleport(playerId, 6, 0, 6, Facing.FrontLeft)
              .catch((e) => console.error(e));
          });
    
          bot.message.send(`Teleported ${playersToTeleport.length} player(s) inside!`);
        } else {
          bot.message.send("You are not the owner and cannot use this command!");
        }
      }else if(message === "!open" && moderators.includes(user.username)){
        if(roomStatus === 0){
          roomStatus = 1;
          bot.message.send("✅Room is open now.✅");
        }else{
          bot.message.send("✅Room is already opened.✅");
        }
      }else if(message === "!close" && moderators.includes(user.username)){
        if(roomStatus === 1){
          roomStatus = 0;
          bot.message.send("❌Room is closed now.❌");
        }else{
          bot.message.send("❌Room is already closed.❌");
        }
      }
  });
  
  const activeLoops = new Map(); // Stores looping emotes per user

const emotes = {
  kiss: { id: "emote-kiss", duration: 3 },
  laugh: { id: "emote-laughing", duration: 3 },
  sit: { id: "idle-loop-sitfloor", duration: 10 },
  lust: { id: "emote-lust", duration: 5 },
  curse: { id: "emoji-cursing", duration: 2.5 },
  greedy: { id: "emote-greedy", duration: 4.8 },
  flex: { id: "emoji-flex", duration: 3 },
  gag: { id: "emoji-gagging", duration: 6 },
  celebrate: { id: "emoji-celebrate", duration: 4 },
  macarena: { id: "dance-macarena", duration: 12.5 },
  tiktok8: { id: "dance-tiktok8", duration: 11 },
  blackpink: { id: "dance-blackpink", duration: 7 },
  model: { id: "emote-model", duration: 6.3 },
  tiktok2: { id: "dance-tiktok2", duration: 11 },
  pennywise: { id: "dance-pennywise", duration: 1.5 },
  bow: { id: "emote-bow", duration: 3.3 },
  russian: { id: "dance-russian", duration: 10.3 },
  curtsy: { id: "emote-curtsy", duration: 2.8 },
  snowball: { id: "emote-snowball", duration: 6 },
  hot: { id: "emote-hot", duration: 4.8 },
  snowangel: { id: "emote-snowangel", duration: 6.8 },
  charge: { id: "emote-charging", duration: 8.5 },
  cartdance: { id: "dance-shoppingcart", duration: 8 },
  confused: { id: "emote-confused", duration: 9.3 },
  hype: { id: "idle-enthusiastic", duration: 16.5 },
  psychic: { id: "emote-telekinesis", duration: 11 },
  float: { id: "emote-float", duration: 9.3 },
  teleport: { id: "emote-teleporting", duration: 12.5 },
  swordfight: { id: "emote-swordfight", duration: 6 },
  maniac: { id: "emote-maniac", duration: 5.5 },
  energyball: { id: "emote-energyball", duration: 8.3 },
  snake: { id: "emote-snake", duration: 6 },
  sing: { id: "idle_singing", duration: 11 },
  frog: { id: "emote-frog", duration: 15 },
  pose: { id: "emote-superpose", duration: 4.6 },
  cute: { id: "emote-cute", duration: 7.3 },
  tiktok9: { id: "dance-tiktok9", duration: 13 },
  weird: { id: "dance-weird", duration: 22 },
  tiktok10: { id: "dance-tiktok10", duration: 9 },
  pose7: { id: "emote-pose7", duration: 5.3 },
  pose8: { id: "emote-pose8", duration: 4.6 },
  casualdance: { id: "idle-dance-casual", duration: 9.7 },
  pose1: { id: "emote-pose1", duration: 3 },
  pose3: { id: "emote-pose3", duration: 4.7 },
  pose5: { id: "emote-pose5", duration: 5 },
  cutey: { id: "emote-cutey", duration: 3.5 },
  punkguitar: { id: "emote-punkguitar", duration: 10 },
  zombierun: { id: "emote-zombierun", duration: 10 },
  fashionista: { id: "emote-fashionista", duration: 6 },
  gravity: {id: "emote-gravity", duration: 9.8},
  icecream: { id: "dance-icecream", duration: 15 },
  wrongdance: { id: "dance-wrong", duration: 13 },
  uwu: { id: "idle-uwu", duration: 25 },
  tiktok4: { id: "idle-dance-tiktok4", duration: 16 },
  shy: { id: "emote-shy2", duration: 5 },
  anime: { id: "dance-anime", duration: 7.8 },
};
// Promote the Free Grab Room every 2 minutes

bot.on("chatCreate", async (user, message) => {
    const args = message.toLowerCase().split(" "); // Convert input to lowercase
    const command = args[0];
    const emoteName = args.slice(1).join(" ");
    if (command === "!help") {
        bot.message.send("\n📜 Available Commands:\n🔹 !join - Join the Queue.\n🔹 !queue - Check the queue.\n🔹 !assistemote - Get emote command assistance.\n\nUse these commands to interact with the bot!");
        }
    if (command === "!assistemote") {
      const assistMessage = `
        List of Commands for User Fun:
        1.!emote <emote_name>
        2.!loop <emote_name>
        3.!stop
        4.!emotelist <page_number>
        Use these commands to have fun with emotes! 🎉
      `;
  
      bot.message.send(assistMessage).catch(e => console.error(e));
    }
    else if (command === "!emotelist") {
      const page = args[1] ? parseInt(args[1]) : 1;
      
      if (isNaN(page) || page < 1 || page > emotePages) {
        bot.message.send(`Usage: !emotelist <page_number>. Valid page numbers are from 1 to ${emotePages}.`);
        return;
      }
  
      const emoteKeys = Object.keys(emotes);
      const emotesForPage = emoteKeys.slice((page - 1) * 7, page * 7);
      
      let emoteListMessage = `Emote list (Page ${page}/${emotePages}):\n`;
      emotesForPage.forEach(emote => {
        emoteListMessage += `\`${emote}\` - ${emotes[emote].id}\n`;
      });
  
      bot.message.send(emoteListMessage).catch(e => console.error(e));
    }
    else if (command === "!emote") {
      if (!emotes[emoteName]) {
        bot.message.send(`Invalid emote name: ${emoteName}`);
        return;
      }
  
      bot.player.emote(user.id, emotes[emoteName].id)
        .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
  
    } else if (command === "!loop") {
      if (!emotes[emoteName]) {
        bot.message.send(`Invalid emote name: ${emoteName}`);
        return;
      }
  
      // Stop previous loop if already active for the user
      if (activeLoops.has(user.id)) {
        clearInterval(activeLoops.get(user.id));
      }
  
      // Start looping the emote
      const loopInterval = setInterval(() => {
        bot.player.emote(user.id, emotes[emoteName].id)
          .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
      }, emotes[emoteName].duration * 1000);
  
      activeLoops.set(user.id, loopInterval);
      bot.message.send(`Looping ${emoteName} for ${user.username}.`);
  
    } else if (command === "!stop") {
      if (activeLoops.has(user.id)) {
        clearInterval(activeLoops.get(user.id));
        activeLoops.delete(user.id);
        bot.message.send(`Stopped looping emotes for ${user.username}.`);
      } else {
        bot.message.send(`No active emote loop to stop.`);
      }
    }
  });



bot.login(token,room);