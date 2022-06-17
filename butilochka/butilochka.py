import requests
import websocket
import json
import html
import math
from .utils import objects


class Client:
    def __init__(self, vk_user_id: int = None, vk_token: str = None, app_hash: str = None) -> None:
        self.api = "https://butilochka.cdnvideo.ru/"
        self.user: objects.Login = objects.Login({})
        self.servers = self.__servers()
        self.token = f"{app_hash}:{vk_token}"
        self.create_connection()
        if vk_user_id:
            self.login(vk_user_id, self.token)

    def login(self, vk_user_id: int, token: str):
        data = {
            "screen": [1349,620,1000,1366,768,1000],
            "locale": "ru-RU",
            "tz_offset": 3,
            "system_id": "827788368467154f50a94f3a3898f173",
            "user_agent": "",
            "type": "login",
            "id": f"{vk_user_id}",
            "photo_url":" https://vk.com/images/camera_200.png",
            "auth": token,
            "avg_friends_age": 15,
            "client": "html5",
            "client_v": "web",
            "viewer": {
                "id": vk_user_id,
                "bdate": "24.5.1914",
                "has_mobile": 1,
                "photo_big": "https://vk.com/images/camera_200.png",
                "status": "",
                "sex": 2,
                "first_name": "Игрок",
                "last_name": "Игроковский",
                "can_access_closed": True,
                "is_closed": False
            },
            "referrer_type": "github/Zakovskiy"
        }
        self.send(data)
        data = self.get_data("login")
        self.user = data.data
        return data

    def get_items(self):
        data = {
            "type": "items_get"
        }
        self.send(data)
        return self.get_data("items_get")

    def league_info(self):
        data = {
            "type": "league_info"
        }
        self.send(data)
        return self.get_data("league_info")

    def report_activity(self):
        data = {
            "type": "report_activity"
        }
        self.send(data)

    def get_friend_game(self, ids: [str]):
        data = {
            "type": "get_friend_games",
            "friend_ids": ids,
        }
        self.send(data)
        return self.get_data("friend_games")

    def join_room(self, game_id: int):
        data = {
            "type": "goto_history",
            "game_id": game_id
        }
        self.send(data)

    def game_turn(self):
        data = {
            "type": "game_turn",
        }
        self.send(data)

    def game_kiss(self, user_id: str):
        data = {
            "type": "game_kiss",
            "receiver_id": user_id
        }
        self.send(data)

    def create_connection(self):
        self.ws = websocket.create_connection("wss://bottle-vk.ciliz.com:4444/")

    def send(self, data: dict):
        stringify = json.dumps(data)
        utf8s = html.unescape(stringify)
        str = (''.join(map(chr, [math.floor(len(utf8s) / 256), len(utf8s) % 256]))) + utf8s
        self.ws.send_binary(str)

    def recv(self):
        data = self.ws.recv()[2:]
        return objects.Event(json.loads(data))

    def get_data(self, type: str):
        data = self.recv()
        while data.type != type:
            data = self.recv()
        return data

    def __servers(self):
        data = requests.get(f"{self.api}mobile/server.json").json()
        return data
