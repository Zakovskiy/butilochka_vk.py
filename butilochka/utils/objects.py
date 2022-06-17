
class Event:
    def __init__(self, data: dict) -> None:
        EVENTS = {"login": Login, "game_enter": GameEnter, "game_music": GameMusic, "game_chat_history": GameChatHistory,
            "game_kiss": GameKiss, "game_turn_offer": GameTurnOffer, "game_turn": GameTurn, "game_chat": GameChat,
            "game_gesture": GameGesture, "game_leave": GameLeave, "game_join": GameJoin, "other_client_shutdown": OtherClientShutdown,
            "items_get": ItemsGet, "league_info": LeagueInfo, "game_refuse": GameRefuse, "friend_games": FriendGames}
        self.json: dict = data
        self.type = data.get("type")
        try: self.data = EVENTS[self.type](self.json)
        except: self.data = self.json

class Login:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.welcome_bonus_upto: int = data.get("welcome_bonus_upto")
        self.is_admin: bool = data.get("is_admin")
        self.birthday_ts: int = data.get("birthday_ts")
        self.total_kisses: int = data.get("total_kisses")
        self.ip_country: str = data.get("ip_country")
        self.tokens_vip_ms: int = data.get("tokens_vip_ms")
        self.status: str = data.get("status")
        self.tokens: int = data.get("tokens")
        self.age: int = data.get("age")
        self.timestamp: int = data.get("timestamp")
        self.price_rank: int = data.get("price_rank")
        self.dj_score: int = data.get("dj_score")
        self.pass_state: str = data.get("pass_state")
        self.price: int = data.get("price")
        self.gold: int = data.get("gold")
        self.max_league: int = data.get("max_league")
        self.gestures_rank: str = data.get("gestures_rank")
        self.dj_score_rank: int = data.get("dj_score_rank")
        self.clients: list = data.get("clients")
        self.harem_price: int = data.get("harem_price")
        self.region: str = data.get("region")
        self.verified: bool = data.get("verified")
        self.total_kisses_rank: int = data.get("total_kisses_rank")
        self.name: str = data.get("name")
        self.country: str = data.get("country")
        self.options: dict = data.get("options")
        self.gold_real: int = data.get("gold_real")
        self.block_user_ids: list = data.get("block_user_ids")
        self.city: str = data.get("city")
        self.tickets: int = data.get("tickets")
        self.vip_trial_available: bool = data.get("vip_trial_available")
        self.achievements_ms: int = data.get("achievements_ms")
        self.harem_price_rank: int = data.get("harem_price_rank")
        self.gestures: int = data.get("gestures")
        self.inbox: list = data.get("inbox")
        self.rewarded_video_ms: int = data.get("rewarded_video_ms")
        self.abtest: dict = data.get("abtest")
        self.male: bool = data.get("male")
        self.league: int = data.get("league")
        self.is_new: bool = data.get("is_new")
        self.percent_bonus: str = data.get("percent_bonus")
        self.rr_available: int = data.get("rr_available")
        self.tokens_vip: int = data.get("tokens_vip")
        self.created_at: int = data.get("created_at")
        self.gifts: list = data.get("gifts")
        self.prev_login: int = data.get("prev_login")
        self.id: int = data.get("id")
        self.pass_premium: bool = data.get("pass_premium")
        self.social: str = data.get("social")

class GameEnter:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.game_id: int = data.get("game_id")
        self.active_action: str = data.get("active_action")
        self.active_id: str = data.get("active_id")
        self.algo: str = data.get("algo")
        self.bottle_type: str = data.get("bottle_type")
        self.participants: list = []
        for participant in data.get("participants", []):
            self.participants.append(Participant(participant))
        self.passive_action: str = data.get("passive_action")
        self.passive_id: int = data.get("passive_id")
        self.state: str = data.get("state")
        self.turn_ts: int = data.get("turn_ts")

class Participant:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.age: int = data.get("age")
        self.ava_gift: str = data.get("ava_gift")
        self.ava_gift_random: int = data.get("ava_gift_random")
        self.birthday_ts: int = data.get("birthday_ts")
        self.city: str = data.get("city")
        self.country: str = data.get("country")
        self.drink: str = data.get("drink")
        self.drink_count: int = data.get("drink_count")
        self.drink_random: int = data.get("drink_random")
        self.hat: str = data.get("hat")
        self.hat_random: int = data.get("hat_random")
        self.id: str = data.get("id")
        self.is_new: bool = data.get("is_new")
        self.kisses: int = data.get("kisses")
        self.male: bool = data.get("male")
        self.name: str = data.get("name")
        self.photo_url: str = data.get("photo_url")
        self.region: str = data.get("region")
        self.seat: int = data.get("seat")
        self.verified: bool = data.get("verified")

class GameMusic:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.duration: int = data.get("duration")
        self.artist: str = data.get("artist")
        self.provider: str = data.get("provider")
        self.sender: Sender = Sender(data.get("sender"))
        self.song_id: str = data.get("song_id")
        self.start_timestamp: int = data.get("start_timestamp")
        self.title: str = data.get("title")
        self.url: str = data.get("url")

class Sender:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.id: str = data.get("id")
        self.male: bool = data.get("male")
        self.name: str = data.get("name")
        self.photo_url: str = data.get("photo_url")
        self.recorder_level: int = data.get("recorder_level")
        self.vip: bool = data.get("vip")

class GameChatHistory:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.messages: list = []
        for message in data.get("messages", []):
            self.messages.append(Message(message))

class Message:
    def __init__(self, data: dict) -> None:
        MESSAGES = {"game_chat": GameChat, }
        self.json: dict = data
        self.type: str = data.get("type")
        try: self.data = EVENTS[self.type](self.json)
        except: self.data = self.json

class GameChat:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.body: str = data.get("body")
        self.receiver_id: int = data.get("receiver_id")
        self.receiver_name: str = data.get("receiver_name")
        self.timestamp: int = data.get("timestamp")
        self.user: User = User(data.get("user", {}))

class User:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.id: str = data.get("id")
        self.male: bool = data.get("male")
        self.name: str = data.get("name")
        self.photo_url: str = data.get("photo_url")
        self.frame: str = data.get("frame")
        self.stone: str = data.get("stone")

class GameKiss:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.user_id: str = data["user"]["id"]

class GameTurnOffer:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.user_id: str = data["user"]["id"]

class GameTurn:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.active_id: str = data["active"]["id"]
        self.user_id: str = data["user"]["id"]

class GameGesture:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.gesture: str = data.get("gesture")
        self.timestamp: int = data.get("timestamp")
        self.user: dict = User(data.get("user", {}))

class GameLeave:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.user_id: str = data["user"]["id"]

class GameJoin:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.user: Participant = Participant(data.get("user", {}))

class OtherClientShutdown:
    def __init__(self, data: dict) -> None:
        self.json: dict = data

class ItemsGet:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.items: dict = data.get("items", {})

class LeagueInfo:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.finish_ms: int = data.get("finish_ms")
        self.frame: str = data.get("frame")
        self.gifts: list = data.get("gifts")
        self.gold: list = data.get("gold")
        self.items: dict = data.get("items")
        self.kisses: int = data.get("kisses")
        self.kisses_lim: int = data.get("kisses_lim")
        self.league: int = data.get("league")
        self.league_state: str = data.get("league_state")
        self.max_league: int = data.get("max_league")
        self.move_down: int = data.get("move_down")
        self.move_up: int = data.get("move_up")
        self.start_ms: int = data.get("start_ms")
        self.stone: str = data.get("stone")
        self.tokens: list = data.get("tokens")
        self.users: list = data.get("users")
        self.users_max: int = data.get("users_max")

class GameRefuse:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.user_id: str = data["user"]["id"]

class FriendGames:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.fellows: list = data.get("fellows", [])
        self.friends: list = data.get("friends", [])
        self.game_history: list = []
        for game in data.get("game_history", []):
            self.game_history.append(GameHistory(game))

class Game:
    def __init__(self, data: dict) -> None:
        self.json: dict = data
        self.bottle: str = data.get("bottle")
        self.game_id: int = data.get("game_id")
        self.men: int = data.get("men")
        self.ts: int = data.get("ts")
        self.women: int = data.get("women")