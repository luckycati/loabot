import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.LOSTARK_TOKEN;

const api = axios.create({
  baseURL: "https://developer-lostark.game.onstove.com",
  headers: { Authorization: `bearer ${TOKEN}` },
});

function reply(text) {
  return {
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text } }],
    },
  };
}

app.post("/skill", async (req, res) => {
  try {
    const msg = req.body.userRequest.utterance.trim();
    const name = msg.split(" ").slice(1).join(" ").trim();

    if (!name) return res.json(reply("캐릭터명을 입력해줘"));

    // /ㅈㅂ
    if (msg.startsWith("/ㅈㅂ")) {
      const { data } = await api.get(
        `/armories/characters/${encodeURIComponent(name)}`
      );

      const p = data.Profile;

      return res.json(
        reply(
`[${p.CharacterName}]
직업: ${p.CharacterClassName}
아이템레벨: ${p.ItemMaxLevel}
전투레벨: ${p.CharacterLevel}
원정대레벨: ${p.ExpeditionLevel}`
        )
      );
    }

    // /ㅇㄷ
    if (msg.startsWith("/ㅇㄷ")) {
      const { data } = await api.get(
        `/characters/${encodeURIComponent(name)}/siblings`
      );

      const list = data
        .map(c => `${c.CharacterName} - ${c.ItemMaxLevel}`)
        .join("\n");

      return res.json(reply("원정대 목록\n\n" + list));
    }

    return res.json(reply("지원 명령어: /ㅈㅂ /ㅇㄷ"));

  } catch {
    return res.json(reply("조회 실패 (닉네임 확인)"));
  }
});

app.listen(3000);
