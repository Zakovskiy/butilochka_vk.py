"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var tslib_1 = require("tslib");
// tslint:disable-next-line:no-import-side-effect
require("./css/bottle.less");
var CilizMusicService_1 = require("./js/CilizMusicService");
var CilizVideoService_1 = require("./js/CilizVideoService");
var DefaultPhotos_1 = require("./js/html/DefaultPhotos");
var YouTubePlayer_1 = require("./js/html/music/YouTubePlayer");
var json_1 = require("./js/interfaces/json");
var model_1 = require("./js/model");
var TopsModel_1 = require("./js/models/TopsModel");
var MusicCoordinator_1 = require("./js/MusicCoordinator");
var AchievementsViewModel_1 = require("./js/presenters/AchievementsViewModel");
var ChatPresenter_1 = require("./js/presenters/ChatPresenter");
var DecorSelectionPresenter_1 = require("./js/presenters/DecorSelectionPresenter");
var GiftListBuilder_1 = require("./js/presenters/GiftListBuilder");
var TablePresenter_1 = require("./js/presenters/TablePresenter");
var TutorialPresenter_1 = require("./js/presenters/TutorialPresenter");
var session_1 = require("./js/session");
var FBIGSocial_1 = require("./js/social/FBIGSocial");
var FBSocial_1 = require("./js/social/FBSocial");
var OKSocial_1 = require("./js/social/OKSocial");
var VKSocial_1 = require("./js/social/VKSocial");
var YASocial_1 = require("./js/social/YASocial");
var utils = require("./js/utils");
var UIMusicPlayer = /** @class */ (function () {
    function UIMusicPlayer(gameView, coordinator, sender, player, view) {
        var _this = this;
        this.gameView = gameView;
        this.coordinator = coordinator;
        this.player = player;
        this.view = view;
        player.oncomplete = function () {
            _this.oncomplete && _this.oncomplete();
        };
        player.onloading = function (isLoading) {
            view.isLoading = isLoading;
        };
        player.onprogress = function (timeSec) {
            _this.onprogress && _this.onprogress(timeSec);
        };
        view.djPhoto = sender.photoUrl || '';
        view.isLoading = true;
        if (sender.detail) { // dj can be restored from history
            view.setOnDj(function () {
                _this.ondj && _this.ondj();
            });
        }
        view.setOnPlayer(function () {
            _this.onplayer && _this.onplayer();
        });
        coordinator.onmusicprogress = function (progress) {
            view.progress = progress;
        };
        gameView.musicView = view;
    }
    UIMusicPlayer.prototype.setMuted = function (isMuted) {
        this.player.setMuted(isMuted);
    };
    UIMusicPlayer.prototype.setTitle = function (title) {
        this.view.playerEl.title = title;
    };
    UIMusicPlayer.prototype.destroy = function () {
        this.coordinator.onmusicprogress = undefined;
        this.gameView.musicView = undefined;
        this.player.destroy();
    };
    return UIMusicPlayer;
}());
var AudioProvider = /** @class */ (function () {
    function AudioProvider(factory, gameView, coordinator, service) {
        this.factory = factory;
        this.gameView = gameView;
        this.coordinator = coordinator;
        this.service = service;
    }
    AudioProvider.prototype.prepare = function (music) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service.getMusicUrl(music)];
                    case 1:
                        url = _a.sent();
                        if (!url)
                            return [2 /*return*/, undefined];
                        return [2 /*return*/, {
                                createPlayer: function (sender, startSec) {
                                    return _this.createPlayer(url, sender, startSec);
                                },
                                createPreviewPlayer: function () {
                                    return _this.createPreviewPlayer(url);
                                }
                            }];
                }
            });
        });
    };
    AudioProvider.prototype.createPlayer = function (url, sender, startSec) {
        var _this = this;
        var player = this.factory.createAudioPlayer(url, startSec);
        var view = this.factory.createAudioMusicView();
        view.level = sender.music.level;
        var uiPlayer = new UIMusicPlayer(this.gameView, this.coordinator, sender, player, view);
        uiPlayer.onplayer = function () { var _a; return (_a = _this.onplayer) === null || _a === void 0 ? void 0 : _a.call(_this); };
        uiPlayer.ondj = function () { var _a; return (_a = _this.ondj) === null || _a === void 0 ? void 0 : _a.call(_this, sender); };
        player.play();
        return uiPlayer;
    };
    AudioProvider.prototype.createPreviewPlayer = function (url) {
        var player = this.factory.createAudioPlayer(url, 0);
        player.play();
        return player;
    };
    AudioProvider.prototype.addToStore = function (trans, dlg, receivers) {
        var _this = this;
        if (receivers.length > 1)
            return;
        var name = trans.translate('music:audio');
        dlg.addGiftItem(name, 'g_music', this.service.musicPrice, function () {
            dlg.close();
            _this.onstore && _this.onstore(receivers[0]);
        });
    };
    return AudioProvider;
}());
var YTProvider = /** @class */ (function () {
    function YTProvider(session, factory, gameView, coordinator, service, origin) {
        this.session = session;
        this.factory = factory;
        this.gameView = gameView;
        this.coordinator = coordinator;
        this.service = service;
        this.origin = origin;
    }
    YTProvider.prototype.prepare = function (music) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, YouTubePlayer_1.YouTubePlayer.prepare()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                createPlayer: function (sender, startSec) {
                                    return _this.createPlayer(music, sender, startSec);
                                },
                                createPreviewPlayer: function () {
                                    return _this.createPreviewPlayer(music);
                                }
                            }];
                }
            });
        });
    };
    YTProvider.prototype.createYouTubePlayer = function (music, startSec, quality) {
        var _this = this;
        var player = this.factory.createYouTubePlayer(music.song_id, startSec, quality, this.origin);
        player.onerror = function (errCode) {
            _this.session.youtubeError(music.song_id, errCode);
        };
        return player;
    };
    YTProvider.prototype.createPlayer = function (music, sender, startSec) {
        var _this = this;
        var player = this.createYouTubePlayer(music, startSec, 'small');
        var view = this.factory.createVideoMusicView();
        player.setMusicView(view);
        var uiPlayer = new UIMusicPlayer(this.gameView, this.coordinator, sender, player, view);
        uiPlayer.onplayer = function () {
            _this.onplayer && _this.onplayer();
        };
        uiPlayer.ondj = function () {
            _this.ondj && _this.ondj(sender);
        };
        player.play({ autoPlay: true });
        return uiPlayer;
    };
    YTProvider.prototype.createPreviewPlayer = function (music) {
        return this.createYouTubePlayer(music, 0, 'default');
    };
    YTProvider.prototype.addToStore = function (trans, dlg, receivers) {
        var _this = this;
        if (receivers.length > 1)
            return;
        var name = trans.translate('music:video');
        dlg.addGiftItem(name, 'g_video', this.service.musicPrice, function () {
            dlg.close();
            _this.onstore && _this.onstore(receivers[0]);
        });
    };
    return YTProvider;
}());
var OKVideoProvider = /** @class */ (function () {
    function OKVideoProvider(session, factory, gameView, service, coordinator) {
        this.session = session;
        this.factory = factory;
        this.gameView = gameView;
        this.service = service;
        this.coordinator = coordinator;
    }
    OKVideoProvider.prototype.prepare = function (music) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self;
            return tslib_1.__generator(this, function (_a) {
                self = this;
                return [2 /*return*/, {
                        createPlayer: function (sender, startSec) {
                            return self.createPlayer(music, sender, startSec);
                        },
                        createPreviewPlayer: function () {
                            self.session.viewer;
                            return self.createOkVideoPlayer(music, 0);
                        }
                    }];
            });
        });
    };
    OKVideoProvider.prototype.createOkVideoPlayer = function (music, startSec) {
        var player = this.factory.createOKVideoPlayer(music, startSec);
        // its error prone ATM
        // no error handling
        return player;
    };
    OKVideoProvider.prototype.createPlayer = function (music, sender, startSec) {
        var _this = this;
        var view = this.factory.createVideoMusicView();
        var player = this.createOkVideoPlayer(music, startSec);
        player.setMusicView(view);
        var uiPlayer = new UIMusicPlayer(this.gameView, this.coordinator, sender, player, view);
        uiPlayer.onplayer = function () {
            _this.onplayer && _this.onplayer();
        };
        uiPlayer.ondj = function () {
            _this.ondj && _this.ondj(sender);
        };
        player.play({ autoPlay: true });
        return uiPlayer;
    };
    OKVideoProvider.prototype.addToStore = function (trans, dlg, receivers) {
        var _this = this;
        if (receivers.length > 1)
            return;
        var name = trans.translate('music:video');
        dlg.addGiftItem(name, 'g_video', this.service.musicPrice, function () {
            dlg.close();
            _this.onstore && _this.onstore(receivers[0]);
        });
    };
    return OKVideoProvider;
}());
var SessionFactory = /** @class */ (function () {
    function SessionFactory(session, factory, trans, env, social, config, locale, coordinator) {
        var _this = this;
        this.session = session;
        this.factory = factory;
        this.trans = trans;
        this.env = env;
        this.social = social;
        this.config = config;
        this.locale = locale;
        this.coordinator = coordinator;
        this.leagueDlgBoostersActive = false;
        this.opsInProgress = -1;
        this.responseGiftState = { type: 'ready' };
        this.escape = function (unsafe) { return _this.root.escape(unsafe); };
        this.root.sfxManager.enabled = env.preferences.isSfxEnabled;
        this.achievementsViewModel = new AchievementsViewModel_1.AchievementsViewModel(this.assetsJSON.achievement, social.id, trans);
        if (this.social.id === 'vk') {
            this.storeUrls = {
                ios: 'https://itunes.apple.com/app/spin-bottle-chat-flirt-love/id1158030885',
                android: 'https://play.google.com/store/apps/details?id=com.ciliz.spinthebottle'
            };
        }
        else {
            this.storeUrls = {
                ios: 'https://itunes.apple.com/app/spin-bottle-chat-flirt-love/id1158030885',
                android: 'market://details?id=com.ciliz.spinthebottle'
            };
        }
    }
    Object.defineProperty(SessionFactory.prototype, "animationManager", {
        // env
        get: function () { return this.env.root.animationManager; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionFactory.prototype, "assetsJSON", {
        get: function () { return this.env.assetsJSON; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionFactory.prototype, "imageLoader", {
        get: function () { return this.env.imageLoader; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionFactory.prototype, "imageMetaRegistry", {
        get: function () { return this.env.imageMetaRegistry; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionFactory.prototype, "root", {
        get: function () { return this.env.root; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionFactory.prototype, "sfx", {
        get: function () { return this.env.sfx; },
        enumerable: false,
        configurable: true
    });
    SessionFactory.prototype.getUserAchievements = function (user, achievements) {
        var _this = this;
        var completed = {};
        for (var _i = 0, achievements_1 = achievements; _i < achievements_1.length; _i++) {
            var a = achievements_1[_i];
            completed[a.id] = this.achievementsViewModel.get(a, user);
        }
        return Object.keys(this.assetsJSON.achievement)
            .map(function (id) {
            var disabled = _this.achievementsViewModel.get(new model_1.Achievement(id, 0), user, true);
            return completed[id] || disabled;
        })
            .filter(function (f) { return f === null || f === void 0 ? void 0 : f.visible(_this.session.serverTimer.serverTime); });
    };
    SessionFactory.prototype.showAchievementsList = function (achievements, receiver, session) {
        var _this = this;
        achievements = achievements || [];
        var trans = this.trans;
        var avm = this.getUserAchievements(receiver, achievements);
        var isNew = function (a) {
            return receiver.viewer !== undefined && a.isNew(session.newAchievementsMs);
        };
        var firstNew = avm.filter(function (f) { return isNew(f); })[0];
        var dlg = this.factory.createAchievementsListDialog({
            title: receiver.viewer
                ? trans.translate('dlg:finished_achievements:title')
                : trans.translate('dlg:finished_achievements:other:title') +
                    this.escape(receiver.base.name),
            current: avm.reduce(function (acc, a) { return acc + a.stars; }, 0),
            total: this.achievementsViewModel.calcMaxStars(session.serverTimer.serverTime),
            items: avm.map(function (a) { return ({
                id: a.id,
                name: a.name,
                level: a.level,
                maxLevel: a.maxLevel,
                image: a.image,
                disabled: a.disabled,
                isNew: isNew(a),
                cb: function () { return _this.showAchievement(receiver, a.achievement, a.disabled); }
            }); }),
            scrollToItem: firstNew === null || firstNew === void 0 ? void 0 : firstNew.id,
            tabs: {
                title: trans.translate('dlg:achievements:sort_title'),
                enabled: trans.translate('dlg:achievements:completed'),
                disabled: trans.translate('dlg:achievements:locked')
            }
        });
        dlg.onclose = function () {
            var _a;
            (_a = _this.tablePresenter) === null || _a === void 0 ? void 0 : _a.toggleMiscMenuIndicator(false);
            if (receiver.viewer && firstNew !== undefined)
                session.resetAchievementsMs();
        };
        dlg.open();
    };
    SessionFactory.prototype.showAchievement = function (receiver, achievement, disabled) {
        if (disabled === void 0) { disabled = false; }
        var avm = this.achievementsViewModel.get(achievement, receiver, disabled);
        var trans = this.trans;
        var dlg = this.factory.createAchievementDialog({
            title: trans.translate('dlg:achievement:info_title'),
            subtitle: avm.getSubtitle(),
            userName: receiver.viewer ? undefined : this.escape(receiver.base.name),
            name: avm.name,
            term: !avm.disabled && avm.level < avm.maxLevel - 1 ? avm.nextTerm : avm.term,
            image: avm.image,
            level: avm.level,
            maxLevel: avm.maxLevel,
            disabled: avm.disabled
        });
        dlg.open();
    };
    SessionFactory.prototype.showDailyBonus = function (session, day, gold) {
        var _this = this;
        var trans = this.trans;
        var daysTitles = [
            trans.translate('dlg:day_bonus:day:1'),
            trans.translate('dlg:day_bonus:day:2'),
            trans.translate('dlg:day_bonus:day:3'),
            trans.translate('dlg:day_bonus:day:4'),
            trans.translate('dlg:day_bonus:day:5')
        ];
        var dlg = this.factory.createDailyBonusDialog({
            title: trans.translate('dlg:day_bonus:title'),
            description: trans.translate('dlg:day_bonus:desc'),
            today: trans.translate('dlg:day_bonus:today'),
            tomorrow: trans.translate('dlg:day_bonus:tomorrow'),
            getBonusSubtitle: trans.translate('dlg:day_bonus:btn'),
            daysTitles: daysTitles,
            currentDay: day,
            ongetbonus: function (pt) {
                dlg.close();
                _this.addViewerGold(session, session.isPassRunning && session.passPremium ? gold * 2 : gold, 0, pt);
            }
        });
        dlg.scope.addSignal(session.onPassUpdate, function () {
            if (session.isPassRunning) {
                dlg.setPremium(session.passPremium ? {
                    title: trans.translate('dlg:day_bonus:premium_bonus'),
                    bonus: gold
                } : {
                    title: trans.translate('dlg:day_bonus:premium'),
                    onpremium: function () { return _this.showBottlePassPremium(session); }
                });
            }
            else {
                dlg.setPremium();
            }
        }).call();
        dlg.onclose = function () {
            _this.afterDaily(session);
        };
        dlg.open();
    };
    SessionFactory.prototype.addViewerGold = function (session, gold, goldReal, pt) {
        if (this.tablePresenter)
            this.tablePresenter.addViewerGold(gold, goldReal, pt);
        else
            session.viewer.viewer.incGold(gold, goldReal);
    };
    SessionFactory.prototype.addViewerTokens = function (session, tokens) {
        if (this.tablePresenter)
            this.tablePresenter.addViewerTokens(tokens);
        else
            session.viewer.viewer.incTokens(tokens);
    };
    SessionFactory.prototype.afterDaily = function (session) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var social, result, result1, can;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        social = this.social;
                        return [4 /*yield*/, this.showRewardedRetention(session, 'after_daily')];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/];
                        if (!(social instanceof VKSocial_1.VKSocial)) return [3 /*break*/, 4];
                        return [4 /*yield*/, social.tryAddToFavorites()];
                    case 2:
                        result = _a.sent();
                        session.trackEvent('favourites_daily', this.social.trackId, result);
                        if (!(result === 'already')) return [3 /*break*/, 4];
                        return [4 /*yield*/, social.requestMessagingIfNotAllowed()];
                    case 3:
                        result1 = _a.sent();
                        session.trackEvent('messaging_daily', this.social.trackId, result1);
                        _a.label = 4;
                    case 4:
                        if (!(social instanceof FBIGSocial_1.FBIGSocial)) return [3 /*break*/, 6];
                        return [4 /*yield*/, social.canSubscribeBot()];
                    case 5:
                        can = _a.sent();
                        if (can) {
                            social.subscribeBot('daily0');
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showReceivedGold = function (session, gold, msgTmpl, purchased) {
        var _this = this;
        var trans = this.trans;
        var position;
        if (purchased) {
            if (this.opsInProgress >= 0) {
                position = this.opsInProgress;
            }
            else {
                var options = this.social.purchaseOptions(trans);
                if (options.length > 0) {
                    var maxOpt = options.reduce(function (acc, opt) {
                        return gold <= (opt.gold + opt.bonus) && acc.gold <= opt.gold
                            ? opt : acc;
                    }, options[0]);
                    position = options.indexOf(maxOpt) + 1;
                }
            }
            this.opsInProgress = -1;
        }
        var dlg = this.factory.createReceivedGoldDialog({
            title: trans.translate('dlg:kiss_bonus:title'),
            context: trans.translate(msgTmpl),
            gold: gold,
            position: position,
            btnTitle: trans.translate('dlg:gold:btn'),
            onclick: function (pt) {
                dlg.close();
                _this.addViewerGold(session, gold, 0, pt);
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showGoldRefunded = function (session, gold) {
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('dlg:gold:refunded:title'),
            context: trans.translate('dlg:gold:refunded:text', gold),
            confirmAction: {
                title: trans.translate('dlg:gold:refunded:btn'),
                onclick: function (pt) {
                    dlg.close();
                    session.viewer.viewer.incGold(-gold, -gold);
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showPromoBonusVK = function (session, gold) {
        var _this = this;
        var trans = this.trans;
        var dlg = this.factory.createReceivedGoldDialog({
            title: 'Подарок!',
            context: '<gold> от ВКонтакте!',
            gold: gold,
            btnTitle: trans.translate('dlg:gold:btn'),
            onclick: function (pt) {
                dlg.close();
                _this.addViewerGold(session, gold, 0, pt);
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showVipBought = function () {
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('dlg:kiss_bonus:title'),
            context: trans.translate('html:dlg:vip:purchased'),
            imageId: 'vip-purchase',
            hasClose: true,
            confirmAction: {
                title: trans.translate('dlg:gold:btn'),
                onclick: function (pt) { return dlg.close(); }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showProfile = function (session, receiver) {
        var _this = this;
        var social = this.social;
        var trans = this.trans;
        // bind on case logout
        var socialId = social.id;
        var formatUser = function (user, profile) {
            var leagueCupImage = (session.isLeaguesEnabled && profile.total_kisses >= 100)
                ? _this.assetsJSON.leagues[profile.league].image
                : '';
            var view = {
                name: _this.escape(user.base.name),
                age: user.detail.age,
                city: _this.escape(user.detail.city || ''),
                photoUrl: user.photoUrl,
                status: _this.escape(profile.status),
                label: receiver.detail.top ? 'top' : receiver.isVip ? 'vip' : '',
                leagueCupImage: leagueCupImage,
                decor: {
                    frame: user.detail.frame ? _this.assetsJSON.frames[user.detail.frame].image : '',
                    stone: user.detail.stone ? _this.assetsJSON.stones[user.detail.stone].image : ''
                },
                premium: receiver.isPremium
            };
            view.totalKisses = utils.splitThousands(profile.total_kisses);
            if (profile.total_kisses_rank && profile.total_kisses_rank < 5000)
                view.totalKissesRank = utils.splitThousands(profile.total_kisses_rank);
            view.djScore = utils.splitThousands(profile.dj_score);
            if (profile.dj_score_rank && profile.dj_score_rank < 5000)
                view.djRank = utils.splitThousands(profile.dj_score_rank);
            view.gestures = utils.splitThousands(profile.gestures);
            if (profile.gestures_rank && profile.gestures_rank < 5000)
                view.gesturesRank = utils.splitThousands(profile.gestures_rank);
            return view;
        };
        var formatHarem = function (owner, price, priceRank) {
            var harem = {
                price: utils.splitThousands(price + 1),
                content: '',
                photoUrl: '',
                name: '',
                priceRank: priceRank > 0 && priceRank < 5000 ? priceRank : 0,
                priceRankTitle: trans.translate('dlg:profile:rank'),
                btnIsDisabled: Boolean(owner.viewer),
                btnTitle: ''
            };
            if (receiver.viewer && !harem.btnIsDisabled) {
                harem.btnTitle = trans.translate('dlg:profile:harem:leave');
            }
            else {
                harem.btnTitle = trans.translate('dlg:profile:harem:btn');
            }
            if (receiver.id === owner.id) {
                harem.content = trans.translate('dlg:profile:harem:no_owner');
                harem.photoUrl = DefaultPhotos_1.dottedPhoto;
                harem.name = '';
                harem.onHaremPhoto = undefined;
            }
            else {
                harem.content = trans.translate('dlg:profile:harem:owner_v2', owner.base.male);
                harem.photoUrl = owner.photoUrl;
                harem.name = _this.escape(owner.base.name);
                harem.onHaremPhoto = function () {
                    _this.showProfile(session, owner);
                };
            }
            return harem;
        };
        var showClaimActions = function () {
            var dlg = _this.factory.createMessageActionsDialog({
                items: [
                    receiver.isBlocked ? {
                        title: trans.translate('dlg:unblock:title'),
                        icon: 'ignore',
                        action: function () {
                            session.unblockUser(receiver.id);
                            dlg.close();
                        }
                    } : {
                        title: trans.translate('dlg:block:title'),
                        icon: 'ignore',
                        action: function () {
                            session.blockUser(receiver.id);
                            dlg.close();
                        }
                    },
                    {
                        title: trans.translate('hint:report_photo'),
                        icon: 'adult',
                        action: function () {
                            session.reportPhoto(receiver.id);
                            dlg.close();
                        }
                    }
                ]
            });
            dlg.open();
        };
        var onGetUserProfile = function (profile) {
            var _a;
            var zodiac = (_a = receiver.detail.birthdayTs) === null || _a === void 0 ? void 0 : _a.zodiacSymbol;
            var dlg = _this.factory.createUserProfileDialog({
                rankSubtitle: trans.translate('dlg:profile:rank'),
                zodiac: zodiac,
                zodiacTooltip: typeof zodiac === 'undefined' ? '' : trans.translate("hint:zodiac:" + zodiac),
                userId: session.viewer.viewer && session.viewer.viewer.isAdmin ? profile.id : undefined,
                onachievements: function () { return _this.showAchievementsList(profile.achievements, receiver, session); },
                onsendmessage: function () {
                    if (receiver.viewer) {
                        _this.showWarning(trans.translate('warning:self_chat:desc'));
                        return;
                    }
                    if (!receiver.game) {
                        _this.showWarning(trans.translate('warning:offline_chat:desc'));
                        return;
                    }
                    _this.root.dialogManager.closeAll();
                    if (_this.chatPresenter) {
                        _this.chatPresenter.receiver = receiver;
                        _this.root.dialogManager.closeExclusiveGroup('drawer');
                    }
                },
                onsendgift: function () {
                    var _a;
                    if (receiver.viewer) {
                        _this.showWarning(trans.translate('warning:self_gift:desc'));
                        return;
                    }
                    if (!receiver.game) {
                        _this.showWarning(trans.translate('warning:offline_gift:desc'));
                        return;
                    }
                    _this.root.dialogManager.closeAll();
                    (_a = _this.showSendGift) === null || _a === void 0 ? void 0 : _a.call(_this, receiver);
                },
                onclaim: receiver.viewer ? undefined : showClaimActions,
                oncup: function () { return _this.showLeagueLadder(session, receiver, profile.league); },
                ondecor: receiver.viewer ? function () { return _this.showDecorSelection(session); } : undefined,
                ongestures: receiver.viewer
                    ? function () {
                        var _a;
                        _this.root.dialogManager.closeAll();
                        (_a = _this.showGestures) === null || _a === void 0 ? void 0 : _a.call(_this);
                    } : undefined
            });
            var setInGame = function (isInGame) {
                dlg.setChatButton(isInGame);
                dlg.setGiftButton(isInGame);
            };
            dlg.scope.addSignal(receiver.onGameEnter, function () { return setInGame(true); });
            dlg.scope.addSignal(receiver.onGameLeave, function () { return setInGame(false); });
            dlg.scope.addSignal(receiver.onDecorChanged, function (id, frame, stone) {
                dlg.setDecor({
                    frame: frame ? _this.assetsJSON.frames[frame].image : '',
                    stone: stone ? _this.assetsJSON.stones[stone].image : ''
                });
            });
            dlg.scope.addSignal(receiver.isChanged, function () {
                dlg.setUser(formatUser(receiver, profile));
                setInGame(Boolean(receiver.game));
            }).call();
            dlg.setHarem(formatHarem(profile.owner, profile.price, profile.price_rank), function () {
                if (receiver.viewer && profile.owner.viewer) {
                    _this.showWarning(trans.translate('dlg:profile:harem:tooltip'));
                }
                else {
                    session.haremPurchase(profile.id, profile.price + 1).then(function (p) {
                        dlg.setHarem(formatHarem(p.newOwner, p.price, p.priceRank), function () {
                            if (p.target.viewer) {
                                _this.showWarning(trans.translate('dlg:profile:harem:tooltip'));
                            }
                            else {
                                _this.showWarning(trans.translate('dlg:profile:harem:purchased', _this.escape(p.target.base.name)));
                            }
                        });
                    }, function (e) { });
                }
            });
            // TODO: track owner
            // no wait
            (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var href;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!social.getProfileUrl) {
                                dlg.setSocial();
                                return [2 /*return*/];
                            }
                            if (socialId === 'local' || socialId === 'ya') {
                                dlg.setSocial();
                                return [2 /*return*/];
                            }
                            dlg.setSocial({ id: socialId });
                            return [4 /*yield*/, social.getProfileUrl(receiver.id)];
                        case 1:
                            href = _a.sent();
                            dlg.setSocial({
                                id: socialId,
                                href: href
                            });
                            return [2 /*return*/];
                    }
                });
            }); })();
            dlg.open();
        };
        session.queryUserProfile(receiver).then(onGetUserProfile, function (e) {
            // ignore
        });
    };
    SessionFactory.prototype.showDecorSelection = function (session, query) {
        var _this = this;
        var p = new DecorSelectionPresenter_1.DecorSelectionPresenter(this.assetsJSON, this.trans, this.session, this.social.id);
        var dlg = this.factory.createDecorSelectionDialog({
            user: {
                age: session.viewer.detail.age,
                name: session.viewer.base.name,
                photoUrl: session.viewer.base.photoUrl
            },
            items: p.Items,
            activeItem: p.find(session.viewer.detail),
            onApply: function (decor) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var purchased;
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(decor.frame && decor.price.price)) return [3 /*break*/, 2];
                            return [4 /*yield*/, session.itemPurchase(decor.frame.type, decor.price.price)];
                        case 1:
                            purchased = _c.sent();
                            if (!purchased)
                                return [2 /*return*/];
                            _c.label = 2;
                        case 2:
                            session.setDecorations(((_a = decor.frame) === null || _a === void 0 ? void 0 : _a.type) || '', ((_b = decor.stone) === null || _b === void 0 ? void 0 : _b.type) || '');
                            return [2 /*return*/];
                    }
                });
            }); }
        });
        if (query) {
            var item = p.find(query);
            dlg.setSelectedItem(item);
        }
        dlg.scope.addSignal(session.viewer.isChanged, function () {
            dlg.setItems(p.Items);
        });
        dlg.scope.addSignal(session.viewer.onDecorChanged, function (id, frame, stone) {
            var item = p.find(session.viewer.detail);
            dlg.setActiveItem(item);
        });
        dlg.open();
    };
    SessionFactory.prototype.showBoostersList = function (session) {
        var _this = this;
        var getCategories = function () {
            var _a;
            if (!session.viewer.viewer)
                return;
            var categories = {};
            var _loop_1 = function (b) {
                var booster = _this.assetsJSON.boosters[b];
                if (!categories[booster.category]) {
                    categories[booster.category] = {
                        title: _this.trans.translate("dlg:boosters:section:" + booster.category),
                        boosters: []
                    };
                }
                var timers = session.viewer.viewer.timers;
                var isActive = Boolean(timers[b] && timers[b].leftTimeSec > 0);
                var cooldown = isActive
                    ? "" + utils.secondsToMMSS(timers[b].leftTimeSec)
                    : undefined;
                var item = {
                    image: booster.image,
                    count: (_a = session.viewer.viewer.items[b]) !== null && _a !== void 0 ? _a : 0,
                    isActive: isActive,
                    cooldown: cooldown,
                    onaction: function () { return _this.showBooster(session, b); }
                };
                categories[booster.category].boosters.push(item);
            };
            for (var _i = 0, BOOSTERS_1 = json_1.BOOSTERS; _i < BOOSTERS_1.length; _i++) {
                var b = BOOSTERS_1[_i];
                _loop_1(b);
            }
            return categories;
        };
        var categories = getCategories();
        if (!categories)
            return;
        var dlg = this.factory.createBoostersListDialog({
            title: this.trans.translate('table:menu:boosters'),
            subtitle: this.trans.translate('dlg:boosters:desc'),
            categories: categories
        });
        var update = function () {
            var cat = getCategories();
            if (!cat) {
                dlg.close();
                return;
            }
            dlg.setCategories(cat);
        };
        dlg.scope.addSignal(session.viewer.isChanged, update);
        dlg.scope.addSignal(session.onLeagueUpdate, update);
        dlg.scope.addInterval(update, 1000);
        dlg.open();
    };
    SessionFactory.prototype.showBooster = function (session, id) {
        var _this = this;
        var getData = function () {
            var _a;
            if (!session.viewer.viewer)
                return;
            var booster = _this.assetsJSON.boosters[id];
            var timers = session.viewer.viewer.timers[id];
            var count = (_a = session.viewer.viewer.items[id]) !== null && _a !== void 0 ? _a : 0;
            var isActive = Boolean(timers && timers.leftTimeSec > 0);
            var cooldown = isActive
                ? "" + utils.secondsToMMSS(timers.leftTimeSec)
                : undefined;
            var data = {
                booster: {
                    image: booster.image,
                    count: count,
                    isActive: Boolean(cooldown),
                    cooldown: cooldown
                }
            };
            switch (booster.category) {
                case 'choice':
                    data.info = {
                        type: 'disabled',
                        title: _this.trans.translate('dlg:booster_info:table_activation:info')
                    };
                    break;
                case 'league':
                    if (!session.leagueInfo || session.leagueInfo.state !== 'running') {
                        data.info = {
                            title: _this.trans.translate('dlg:booster_info:not_in_leagues:info')
                        };
                        break;
                    }
                    var enabled = count > 0 && !isActive;
                    if (id === 'league_kiss2x') {
                        if (session.leagueInfo.limit === 'kiss') {
                            enabled = false;
                            data.info = {
                                type: 'warning',
                                title: _this.trans.translate('dlg:booster_info:league_lim_reached:info')
                            };
                        }
                        else {
                            data.info = {
                                title: _this.trans.translate('dlg:booster_info:league_kiss2x:info'),
                                score: Math.max(session.leagueInfo.kisses_lim - session.leagueInfo.kisses, 0)
                            };
                        }
                    }
                    if (id === 'league5') {
                        data.info = {
                            title: _this.trans.translate('dlg:booster_info:league5:info'),
                            score: session.leagueInfo.users.filter(function (u) { return u.id === session.viewer.id; })[0].score
                        };
                    }
                    if (id === 'league_kiss_lim10') {
                        data.info = {
                            title: _this.trans.translate('dlg:booster_info:league_kiss_lim10:info'),
                            score: session.leagueInfo.kisses_lim
                        };
                    }
                    data.button = {
                        title: isActive
                            ? _this.trans.translate('dlg:booster_info:activated:btn')
                            : _this.trans.translate('dlg:booster_info:activate:btn'),
                        enabled: enabled,
                        onclick: function () {
                            var title = _this.trans.translate("dlg:booster_info:" + id + ":title");
                            if (count === 0) {
                                _this.showWarning(_this.trans.translate('dlg:booster_info:no_available:toast', title));
                            }
                            else if (isActive) {
                                _this.showWarning(_this.trans.translate('dlg:booster_info:activated:toast', title));
                            }
                            else if (id === 'league_kiss2x' && session.leagueInfo.limit === 'kiss') {
                                _this.showWarning(_this.trans.translate('dlg:booster_info:unactivatalbe:toast', title));
                            }
                            else {
                                session.itemsUse(id);
                            }
                        }
                    };
                    break;
                default:
                    (function (x) { })(booster.category);
            }
            return data;
        };
        var data = getData();
        if (!data)
            return;
        var dlg = this.factory.createBoosterDialog({
            title: this.trans.translate("dlg:booster_info:" + id + ":title"),
            description: this.trans.translate("dlg:booster_info:" + id + ":desc"),
            data: data
        });
        var update = function () {
            var d = getData();
            if (!d) {
                dlg.close();
                return;
            }
            dlg.setData(d);
        };
        dlg.scope.addSignal(session.viewer.isChanged, update);
        dlg.scope.addSignal(session.onLeagueUpdate, update);
        dlg.scope.addInterval(update, 1000);
        dlg.open();
    };
    SessionFactory.prototype.showLeagueKiss2xWarning = function () {
        var name = this.trans.translate('dlg:booster_info:league_kiss2x:title');
        var message = this.trans.translate('game:choose:booster_over', name);
        this.showWarning(message);
    };
    SessionFactory.prototype.showTimerWarning = function (messageGen) {
        var dlg = this.factory.createTimerToastDialog(messageGen);
        dlg.open();
        return dlg;
    };
    SessionFactory.prototype.showWarning = function (message, icon) {
        var dlg = this.factory.createToastDialog(message, icon);
        dlg.open();
    };
    SessionFactory.prototype.showInfo = function (message, cb) {
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            context: message,
            confirmAction: {
                title: trans.translate('dlg:harem:btn'),
                onclick: function () {
                    dlg.close();
                    cb && cb();
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showWelcomeBonus = function (session) {
        var _this = this;
        var ts = session.welcomeBonusTs;
        if (!ts || ts.leftTimeSec <= 0)
            return;
        var trans = this.trans;
        var social = this.social;
        var language = this.locale.locale;
        var opt = social.welcomeOffer(trans);
        if (!opt)
            throw new Error("Welcome option is not supported for social: " + social.toString());
        session.clientEvent({ type: 'welcome_dialog' });
        var dlg = this.factory.createWelcomeBonusDialog({
            title: trans.translate('welcome_offer:title:short'),
            description: trans.translate('welcome_offer:body:short'),
            lang: language === 'ru' ? 'ru' : 'en',
            remaining: trans.translate('welcome_offer:remaining'),
            regularHearts: opt.regularGold,
            offerHearts: opt.offeredGold,
            currency: opt.price,
            btnNoTitle: trans.translate('welcome_offer:goto_bank'),
            btnNoAction: function () {
                dlg.close();
                _this.showBankWithoutPromo(session);
                session.clientEvent({ type: 'welcome_no' });
            },
            btnYesTitle: trans.translate('welcome_offer:purchase'),
            btnYesAction: function () {
                dlg.close();
                opt.purchase();
                session.clientEvent({ type: 'welcome_yes' });
            }
        });
        dlg.scope.addInterval(function () {
            if (ts.leftTimeSec > 0) {
                dlg.setTimer(utils.secondsToHHMMSS(ts.leftTimeSec));
            }
            else {
                dlg.close();
            }
        }, 1000).call();
        dlg.open();
    };
    SessionFactory.prototype.showPercentBonus = function (session, percent, ts) {
        var _this = this;
        var social = this.social;
        var dlg = this.factory.createPercentBonusDialog({
            onticket: function () {
                session.activatePercentBonus().then(function (bonus) {
                    if (bonus > 0) {
                        dlg.setBonus(bonus, function () {
                            _this.showBank(session);
                            dlg.close();
                        });
                    }
                });
            },
            eventType: social.id === 'vk' ? 'black-friday-vk' : 'black-friday-ok'
        });
        if (percent > 0) {
            dlg.setBonus(percent, function () {
                _this.showBank(session);
                dlg.close();
            });
        }
        if (ts) {
            dlg.scope.addInterval(function () {
                if (ts.leftTimeSec > 0) {
                    dlg.setTimer(utils.secondsToHHMMSS(ts.leftTimeSec));
                }
                else {
                    dlg.close();
                }
            }, 1000).call();
        }
        dlg.open();
    };
    SessionFactory.prototype.showVKQuest = function (session, bonus) {
        var _this = this;
        if (!session.vkQuest)
            return;
        var vkQuest = session.vkQuest;
        var isFinished = bonus !== undefined;
        var dlg = this.factory.createVKQuestDialog({
            isFinished: isFinished,
            onclick: function (pt) {
                dlg.close();
                if (bonus)
                    _this.addViewerGold(session, bonus, 0, pt);
            }
        });
        dlg.open();
        if (isFinished)
            return;
        dlg.scope.addSignal(session.viewer.isChanged, function () {
            var kissesLeft = 100 - (session.viewer.viewer.totalKisses - vkQuest.kisses);
            if (kissesLeft > 0) {
                dlg.setKisses(kissesLeft);
            }
            else {
                dlg.close();
            }
        }).call();
        dlg.scope.addInterval(function () {
            if (vkQuest.ts.leftTimeSec > 0) {
                var time = vkQuest.ts.leftTimeSec > 60 * 60 * 24
                    ? utils.secondsToLongText(vkQuest.ts.leftTimeSec, _this.trans)
                    : utils.secondsToHHMMSS(vkQuest.ts.leftTimeSec);
                dlg.setTimer(time);
            }
            else {
                dlg.close();
            }
        }, 1000);
    };
    SessionFactory.prototype.showRewardedRetention = function (session, reference) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tasks, gold, dlg, token, goals;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.social.rewardedRetention) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.social.rewardedRetention(this.trans)];
                    case 1:
                        tasks = _a.sent();
                        if (tasks.length === 0) {
                            return [2 /*return*/, false];
                        }
                        gold = session.rewardedRetentionAvailable;
                        if (gold <= 0) {
                            session.trackEvent('rewret', 'noreward', reference);
                            return [2 /*return*/, false];
                        }
                        dlg = this.factory.createRetentionRewardDialog({
                            title: this.trans.translate('game:banner:free_hearts'),
                            btnTitle: this.trans.translate('dlg:invite_teaser:btn'),
                            bonus: gold,
                            oncomplete: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var gold;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dlg.close();
                                            return [4 /*yield*/, session.claimRewardedRetention(tasks.map(function (t) { return t.analytics; }))];
                                        case 1:
                                            gold = _a.sent();
                                            this.showReceivedGold(session, gold, 'dlg:gold:rewarded_retention');
                                            session.trackEvent('rewret', 'reward', reference, gold);
                                            return [2 /*return*/];
                                    }
                                });
                            }); },
                            oncompleteitem: function () {
                                _this.showWarning(_this.trans.translate('dlg:retention_reward:complete'));
                            }
                        });
                        token = new utils.CancellationToken();
                        return [4 /*yield*/, Promise.all(tasks.map(function (t) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var alreadyDone, g;
                                var _this = this;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, t.checkDone()];
                                        case 1:
                                            alreadyDone = _a.sent();
                                            session.trackEvent('rewret', 'check', t.analytics, Number(alreadyDone));
                                            g = {
                                                btnTitle: t.action,
                                                description: t.description,
                                                isComplete: alreadyDone,
                                                onaction: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                    var done;
                                                    return tslib_1.__generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, t.do(token)];
                                                            case 1:
                                                                done = _a.sent();
                                                                session.trackEvent('rewret', 'action', t.analytics, Number(done));
                                                                g.isComplete = done;
                                                                dlg.setGoals(goals, goals.every(function (gg) { return gg.isComplete; }));
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }
                                            };
                                            return [2 /*return*/, g];
                                    }
                                });
                            }); }))];
                    case 2:
                        goals = _a.sent();
                        dlg.setGoals(goals, goals.every(function (gg) { return gg.isComplete; }));
                        dlg.onclose = function () {
                            session.trackEvent('rewret', 'dlg_close', reference);
                            token.cancel();
                        };
                        dlg.open();
                        session.trackEvent('rewret', 'dlg_show', reference);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    SessionFactory.prototype.showBank = function (session) {
        if (session.welcomeBonusTs &&
            session.welcomeBonusTs.leftTimeSec > 0 &&
            this.social.welcomeOffer(this.trans)) {
            this.showWelcomeBonus(session);
            return;
        }
        this.showBankWithoutPromo(session);
    };
    SessionFactory.prototype.showBankWithoutPromo = function (session) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var social, trans, calcPercentBonus, purchaseOptions, anyOptionSelected, calcOptions, percent, dlg, updateRewardedVideoOption, hasVipOption, vipUpdate, hasPremiumOption, premiumTimer_1, premiumUpdate, rvPromise, numManualOptions, rvAvailable;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        social = this.social;
                        trans = this.trans;
                        calcPercentBonus = function () {
                            var isPercentBonus = session.percentBonus &&
                                session.percentBonus.purchases_left > 0 &&
                                session.percentBonus.active_upto.leftTime > 0;
                            return isPercentBonus ? session.percentBonus.percent : 0;
                        };
                        purchaseOptions = social.purchaseOptions(trans).sort(function (a, b) { return b.gold - a.gold; });
                        anyOptionSelected = false;
                        calcOptions = function (percent) { return purchaseOptions.map(function (opt, i) { return ({
                            gold: opt.gold + Math.floor(opt.gold * percent / 100),
                            bonus: opt.bonus + Math.floor(opt.bonus * percent / 100),
                            price: opt.price,
                            noPercent: percent > 0 ? { gold: opt.gold, bonus: opt.bonus } : undefined,
                            label: opt.label,
                            onclick: function () {
                                _this.opsInProgress = i + 1;
                                anyOptionSelected = true;
                                var total = opt.gold + opt.bonus + Math.floor((opt.gold + opt.bonus) * percent / 100);
                                opt.purchase(total);
                                dlg.close();
                            }
                        }); }); };
                        percent = calcPercentBonus();
                        dlg = this.factory.createBankDialog({
                            title: trans.translate('bank:title'),
                            bonusDesc: trans.translate('bank:bonus:big'),
                            options: calcOptions(percent),
                            specialOptions: [],
                            percentBonus: percent > 0 ? {
                                title: trans.translate('bank:promo:title'),
                                type: 'bonus',
                                countTitle: trans.translate('bank:promo:count'),
                                count: session.percentBonus.purchases_left
                            } : undefined
                        });
                        updateRewardedVideoOption = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var _a, ts, price, rv;
                            var _this = this;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = session.rewardedVideo, ts = _a.ts, price = _a.gold;
                                        if (!social.prepareRewardedVideo || !ts)
                                            return [2 /*return*/, false];
                                        if (ts.leftTimeSec > 0) {
                                            dlg.scope.addIntervalPred(function () {
                                                if (ts.leftTimeSec > 0) {
                                                    dlg.setRewardedVideoOption({
                                                        price: price,
                                                        title: trans.translate('bank:rewardedvideo:desc2'),
                                                        state: 'cooldown',
                                                        action: utils.secondsToHHMMSS(ts.leftTimeSec),
                                                        onclick: function () { return _this.showWarning(trans.translate('hint:rewardedvideo:timeout')); }
                                                    });
                                                    return true;
                                                }
                                                else {
                                                    updateRewardedVideoOption();
                                                    return false;
                                                }
                                            }, 1000).call();
                                            return [2 /*return*/, true];
                                        }
                                        return [4 /*yield*/, social.prepareRewardedVideo()];
                                    case 1:
                                        rv = _b.sent();
                                        if (!rv) {
                                            session.rewardedVideoNoAds();
                                            return [2 /*return*/, false];
                                        }
                                        dlg.setRewardedVideoOption({
                                            price: price,
                                            title: trans.translate('bank:rewardedvideo:desc2'),
                                            state: 'ready',
                                            action: trans.translate('bank:rewardedvideo:btn'),
                                            onclick: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var e_1, err;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            dlg.close();
                                                            session.rewardedVideoStart();
                                                            this.coordinator.enterMute('rv');
                                                            _a.label = 1;
                                                        case 1:
                                                            _a.trys.push([1, 3, , 4]);
                                                            console.log('rewardedVideo: started');
                                                            return [4 /*yield*/, rv.show()];
                                                        case 2:
                                                            _a.sent();
                                                            console.log('rewardedVideo: finished');
                                                            session.claimRewardedVideoBonus();
                                                            return [3 /*break*/, 4];
                                                        case 3:
                                                            e_1 = _a.sent();
                                                            console.log('rewardedVideo:', e_1);
                                                            err = e_1 instanceof Error
                                                                ? 'notError: ' + e_1
                                                                : JSON.stringify(e_1);
                                                            session.rewardedVideoError(err);
                                                            return [3 /*break*/, 4];
                                                        case 4:
                                                            this.coordinator.leaveMute('rv');
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }
                                        });
                                        return [2 /*return*/, true];
                                }
                            });
                        }); };
                        if (percent > 0) {
                            dlg.scope.addIntervalPred(function () {
                                var percent = calcPercentBonus();
                                if (percent > 0) {
                                    dlg.setPromotionTimer(utils.secondsToHHMMSS(session.percentBonus.active_upto.leftTimeSec));
                                    return true;
                                }
                                else {
                                    dlg.setOptions(calcOptions(percent));
                                    dlg.setPromotionTimer('');
                                    dlg.setPercentBonus(undefined);
                                    return false;
                                }
                            }, 1000);
                        }
                        hasVipOption = session.viewer.isVip || social.vipOptions(trans);
                        if (hasVipOption) {
                            vipUpdate = function () {
                                var vipTokensAllowed = Boolean(hasVipOption &&
                                    session.viewer.isVip &&
                                    session.viewer.viewer &&
                                    session.viewer.viewer.tokensVipTs.leftTimeSec <= 0);
                                var option = {
                                    title: trans.translate('dlg:needvip:title'),
                                    desc: trans.translate('bank:vip:status'),
                                    action: trans.translate('mobile:vip:know'),
                                    purchased: session.viewer.isVip,
                                    vipTokensAllowed: vipTokensAllowed,
                                    onclick: function () {
                                        anyOptionSelected = true;
                                        _this.showVip(session);
                                    }
                                };
                                dlg.setVip(option);
                            };
                            vipUpdate();
                            dlg.scope.addSignal(session.viewer.viewer.tokensVipTsChanged, vipUpdate);
                            dlg.scope.addSignal(session.viewer.isChanged, vipUpdate);
                        }
                        hasPremiumOption = session.isPassRunning
                            && (social.premiumOption(trans) || session.viewer.isPremium);
                        if (hasPremiumOption) {
                            premiumUpdate = function () {
                                var _a, _b;
                                var ts = (_a = session.passInfo) === null || _a === void 0 ? void 0 : _a.finishTs;
                                if (!ts)
                                    return;
                                var setPremiumPass = function (timer) {
                                    var _a;
                                    dlg.setpremiumPassOption({
                                        title: trans.translate('dlg:bottle_pass:premium_pass').toUpperCase(),
                                        timer: ((_a = session.passInfo) === null || _a === void 0 ? void 0 : _a.pass_premium) ? timer : undefined,
                                        action: trans.translate('mobile:vip:know'),
                                        onclick: function () { return _this.showBottlePassPremium(session); }
                                    });
                                };
                                setPremiumPass(utils.secondsToLongText(ts.leftTimeSec, trans, 2));
                                if ((_b = session.passInfo) === null || _b === void 0 ? void 0 : _b.pass_premium) {
                                    premiumTimer_1 = dlg.scope.addInterval(function () {
                                        if (ts.leftTimeSec > 0) {
                                            setPremiumPass(utils.secondsToLongText(ts.leftTimeSec, trans, 2));
                                        }
                                        else {
                                            premiumTimer_1.remove();
                                            setPremiumPass();
                                        }
                                    }, 1000);
                                }
                            };
                            dlg.scope.addSignal(session.onPassUpdate, premiumUpdate).call();
                        }
                        dlg.onclose = function () {
                            if (!anyOptionSelected)
                                _this.showRewardedRetention(session, 'bank_idle');
                        };
                        rvPromise = updateRewardedVideoOption();
                        numManualOptions = purchaseOptions.length + (hasVipOption ? 1 : 0) + (hasPremiumOption ? 1 : 0);
                        if (!(numManualOptions === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, rvPromise];
                    case 1:
                        rvAvailable = _a.sent();
                        if (rvAvailable)
                            numManualOptions += 1;
                        _a.label = 2;
                    case 2:
                        if (numManualOptions === 0) {
                            this.showWarning(trans.translate('html:dlg:bank:not_available'));
                        }
                        else {
                            dlg.open();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showTokensBank = function (session) {
        var purchase = function (gold) {
            if (session.buyTokens(gold))
                dlg.close();
        };
        var dlg = this.factory.createTokensBankDialog({
            title: this.trans.translate('dlg:tokens_store:title'),
            options: this.assetsJSON.tokens.bank.map(function (b) {
                return {
                    price: b.price,
                    tokens: b.tokens,
                    onclick: function () { return purchase(b.price); }
                };
            })
        });
        dlg.open();
    };
    SessionFactory.prototype.showInviter = function (inviter) {
        switch (inviter.type) {
            case 'native':
                inviter.invite(this.trans);
                break;
            case 'support':
                this.showSupportInviter(inviter);
                break;
            default: (function (x) { })(inviter);
        }
    };
    SessionFactory.prototype.showSupportInviter = function (inviter) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var users, update, dlg;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inviter.query()];
                    case 1:
                        users = (_a.sent()).map(function (u) { return ({
                            name: u.name,
                            photoUrl: u.photoUrl,
                            onclick: function () {
                                u.invite(_this.trans);
                            }
                        }); });
                        update = function (q) {
                            q = q.toLocaleLowerCase();
                            dlg.setFriends(users.filter(function (u) {
                                return u.name.toLocaleLowerCase().indexOf(q) >= 0;
                            }));
                        };
                        dlg = this.factory.createInviteFriendDialog({
                            title: this.trans.translate('ios:dlg:invite:title'),
                            searchHint: this.trans.translate('ios:dlg:invite:search'),
                            btnTitle: this.trans.translate('ios:dlg:invite:btn'),
                            onsearch: update
                        });
                        update('');
                        dlg.open();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showFriendsInvited = function (session, gold) {
        var _this = this;
        var trans = this.trans;
        var inviter = this.social.createInviter('friends_invited');
        var dlg = this.factory.createInfoDialog({
            hasClose: true,
            context: trans.translate('dlg:gold:invite', gold),
            confirmAction: inviter ? {
                title: trans.translate('dlg:income_invite:btn'),
                bonus: 5,
                onclick: function (pt) {
                    dlg.close();
                    _this.showInviter(inviter);
                }
            } : undefined
        });
        dlg.onclose = function () {
            _this.addViewerGold(session, gold, 0);
        };
        dlg.open();
    };
    SessionFactory.prototype.showShortcut = function (session, bonus, cb) {
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('html:dlg:fb_shortcut:title'),
            context: trans.translate('html:dlg:fb_shortcut:desc'),
            cancelAction: {
                title: trans.translate('html:dlg:fb_shortcut:cancel'),
                onclick: function (pt) {
                    dlg.close();
                }
            },
            confirmAction: {
                title: trans.translate('html:dlg:fb_shortcut:save'),
                bonus: bonus,
                onclick: function (pt) {
                    dlg.close();
                    cb && cb();
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showVip = function (session) {
        var _this = this;
        var social = this.social;
        var trans = this.trans;
        var opts = social.vipOptions(trans) || [];
        var dlg = this.factory.createVipDialog({
            title: trans.translate('mobile:bank:vip'),
            locale: this.locale.locale === 'ru' ? 'ru' : 'en',
            descriptions: {
                gifts: trans.translate('mobile:vip:hint1'),
                smiles: trans.translate('mobile:vip:hint2'),
                bottle: trans.translate('mobile:vip:hint3'),
                ribbon: trans.translate('mobile:vip:hint4'),
                tokens: trans.translate('mobile:vip:hint6')
            },
            vipDesc: trans.translate('mobile:vip:desc1'),
            popularText: trans.translate('bank:popular'),
            options: opts.map(function (o) {
                return {
                    desc: o.period,
                    popular: o.isPopular,
                    price: o.price,
                    term: o.term,
                    isInfo: o.isInfo,
                    onclick: function () { return o.purchase(); }
                };
            }),
            appleNote: social.platformId === 'ios' ? {
                appleText: trans.translate('dlg:vip:apple:text'),
                policyText: trans.translate('dlg:vip:apple:policy'),
                policyLink: 'https://209.selcdn.ru/bottle/legal/bottle_privacy.html',
                termsText: trans.translate('dlg:vip:apple:terms'),
                termsLink: 'https://209.selcdn.ru/bottle/legal/bottle_terms.html'
            } : undefined
        });
        dlg.scope.addSignal(session.viewer.viewer.tokensVipTsChanged, function () {
            if (!session.viewer.isVip || !session.viewer.viewer)
                return;
            var ts = session.viewer.viewer.tokensVipTs;
            var setCooldown = function (seconds) {
                dlg.setTokens({
                    state: 'cooldown',
                    reward: session.vipTokens,
                    vipEnabledText: trans.translate('dlg:vip:tokens:desc'),
                    btnTitle: utils.secondsToHHMMSS(seconds),
                    onclick: function () { return _this.showWarning(trans.translate('dlg:vip:token:toast')); }
                });
            };
            var setTokens = function () {
                dlg.setTokens({
                    state: 'ready',
                    reward: session.vipTokens,
                    vipEnabledText: trans.translate('dlg:vip:tokens:desc'),
                    btnTitle: trans.translate('dlg:vip:btn:collect'),
                    onclick: function () {
                        dlg.close();
                        session.claimVipTokens();
                    }
                });
            };
            if (ts.leftTimeSec > 0) {
                setCooldown(ts.leftTimeSec);
                var tokensVipTimer_1 = window.setInterval(function () {
                    if (!session.viewer.isVip) {
                        clearInterval(tokensVipTimer_1);
                    }
                    else if (ts.leftTimeSec > 0) {
                        setCooldown(ts.leftTimeSec);
                    }
                    else {
                        clearInterval(tokensVipTimer_1);
                        setTokens();
                    }
                }, 1000);
            }
            else {
                setTokens();
            }
        }).call();
        dlg.scope.addSignal(session.viewer.isChanged, function () {
            dlg.setVipEnabled(session.viewer.isVip);
        }).call();
        dlg.open();
    };
    SessionFactory.prototype.showHaremPurchase = function (session, purchase) {
        var _this = this;
        var trans = this.trans;
        var showDialog = function (user, text) {
            var dlg = _this.factory.createHaremPurchaseDialog({
                title: trans.translate('dlg:harem:title'),
                description: text + " " + trans.translate('dlg:harem:for'),
                name: _this.escape(user.base.name),
                photoUrl: user.photoUrl || '',
                price: utils.splitThousands(purchase.price),
                btnTitle: trans.translate('dlg:harem:btn'),
                onuserphoto: function () {
                    _this.showProfile(session, user);
                },
                onaction: function () {
                    session.inboxDelete(purchase);
                    dlg.close();
                }
            });
            dlg.open();
        };
        var target = purchase.target;
        var newOwner = purchase.newOwner;
        var oldOwner = purchase.oldOwner;
        if (newOwner.viewer) {
            // you will see your action results in profile
            session.inboxDelete(purchase);
            return;
        }
        if (target.viewer && oldOwner.viewer) {
            var text1 = trans.translate('dlg:harem:new:viewer:viewer', this.escape(newOwner.base.name), newOwner.base.male);
            showDialog(newOwner, text1);
            return;
        }
        if (target.viewer) {
            var text2 = trans.translate('dlg:harem:new:viewer:old', this.escape(newOwner.base.name), newOwner.base.male, this.escape(oldOwner.base.name));
            showDialog(newOwner, text2);
            return;
        }
        if (oldOwner.viewer && target.id === newOwner.id) {
            var text3 = trans.translate('dlg:harem:target:target:viewer', this.escape(target.base.name), target.base.male);
            showDialog(target, text3);
            return;
        }
        if (oldOwner.viewer) {
            var text4 = trans.translate('dlg:harem:new:target:viewer', this.escape(newOwner.base.name), newOwner.base.male, this.escape(target.base.name));
            showDialog(target, text4);
            return;
        }
        session.inboxDelete(purchase);
    };
    SessionFactory.prototype.showVKSecurityMusicRevert = function (session, gold, context) {
        var _this = this;
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('dlg:music_revert:title'),
            context: context,
            hasClose: true,
            cancelAction: {
                title: 'Отмена',
                onclick: function (pt) {
                    dlg.close();
                    _this.addViewerGold(session, gold, 0, pt);
                }
            },
            confirmAction: {
                title: 'В настройки',
                onclick: function (pt) {
                    dlg.close();
                    _this.addViewerGold(session, gold, 0, pt);
                    window.open('https://m.vk.com/settings?act=privacy', '_blank');
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showBaseMusicRevert = function (session, gold) {
        var _this = this;
        var trans = this.trans;
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('dlg:music_revert:title'),
            context: trans.translate('dlg:music_revert:msg'),
            hasClose: true,
            confirmAction: {
                title: trans.translate('dlg:music_revert:btn'),
                onclick: function (pt) {
                    dlg.close();
                    _this.addViewerGold(session, gold, 0, pt);
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.parseScheduled = function (scheduled) {
        var lang = (scheduled.langs && scheduled.langs[this.locale.toUpperCase()]) || {
            title: this.trans.translate("scheduled:" + scheduled.id + ":title"),
            body: this.trans.translate("scheduled:" + scheduled.id + ":text")
        };
        var title = lang.title;
        var body = lang.body || '';
        var banner = lang.banner || '';
        if (!title || title === '')
            return undefined;
        return {
            title: title.replace('<br/>', '\n'),
            body: body.replace('<br/>', '\n'),
            banner: banner
        };
    };
    SessionFactory.prototype.showScheduledGifts = function (scheduled) {
        var _this = this;
        var lang = this.parseScheduled(scheduled);
        if (!lang)
            return;
        var trans = this.trans;
        var social = this.social;
        var items = scheduled.gifts.map(function (giftId) {
            var gift = _this.assetsJSON.gifts[giftId];
            var bottle = _this.assetsJSON.bottles[giftId];
            if (gift)
                return { isBottle: false, image: gift.storeImage, isTemp: false };
            else if (bottle)
                return { isBottle: true, image: bottle.storeImage, isTemp: false };
            else
                return { isBottle: false, image: '', isTemp: false };
        }).filter(function (item) { return Boolean(item.image); });
        if (items.length === 0)
            return;
        var canShare = Boolean(social.shareScheduled && lang.banner);
        var dlg = this.factory.createGiftUnlockedDialog({
            title: lang.title,
            reason: {
                type: 'scheduled',
                description: lang.body
            },
            hint: trans.translate('dlg:level_up:content3'),
            btnTitle: trans.translate('dlg:level_up:btn_continue'),
            checkboxLabel: canShare ? trans.translate('dlg:scheduled:share') : undefined,
            items: items,
            onaction: function (pt, isPost) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    dlg.close();
                    if (canShare && isPost)
                        (_a = social.shareScheduled) === null || _a === void 0 ? void 0 : _a.call(social, lang.title, lang.body, lang.banner);
                    return [2 /*return*/];
                });
            }); }
        });
        dlg.open();
    };
    SessionFactory.prototype.enterLoading = function (session, loading) {
        var _this = this;
        var trans = this.trans;
        var showQueue = function (gameId, queuePosition) {
            var msg = trans.translate('dlg:loading:no_place', gameId);
            if (queuePosition === 0) {
                msg += trans.translate('dlg:loading:place_no_queue', session.viewer.base.male);
            }
            else {
                msg += trans.translate('dlg:loading:place_queue', queuePosition);
            }
            var dlg = _this.factory.createInfoDialog({
                title: trans.translate('dlg:loading:title'),
                context: msg,
                confirmAction: {
                    title: trans.translate('dlg:loading:btn'),
                    onclick: function (pt) {
                        dlg.close();
                        _this.showChangeTable(session, 'queue_group');
                    }
                }
            });
            dlg.exclusiveGroup = 'queue_group';
            dlg.open();
        };
        this.factory.showLoadingView(this.locale);
        loading.onqueue = showQueue;
        loading.ondestroy = function () {
            _this.root.dialogManager.closeExclusiveGroup('queue_group');
            _this.factory.showEmptyView();
        };
    };
    SessionFactory.prototype.showChangeTable = function (session, dialogGroup) {
        var _this = this;
        var _a;
        var trans = this.trans;
        var dlg = this.factory.createChangeTableDialog({
            title: trans.translate('dlg:change_table:title'),
            friendsSubtitle: trans.translate('ios:dlg:change_table:desc_friends_and_fellows'),
            historySubtitle: trans.translate('dlg:change_table:desc_recent2'),
            randomSubtitle: trans.translate('dlg:change_table:btn_random2'),
            onrandomtable: function () {
                session.gotoRandom();
                dlg.close();
            },
            onviewtable: ((_a = session.viewer.viewer) === null || _a === void 0 ? void 0 : _a.isAdmin) ? function (id) {
                session.gotoViewTable(id);
                dlg.close();
            } : undefined
        });
        if (dialogGroup) {
            dlg.exclusiveGroup = dialogGroup;
        }
        var onQuery = function (games) {
            dlg.setItems({
                friends: games.friends.map(function (x) {
                    return {
                        name: _this.escape(x.name),
                        photoUrl: x.photo,
                        men: x.men,
                        women: x.women,
                        onclick: function () {
                            session.gotoFriend(x.userId);
                            dlg.close();
                        }
                    };
                }),
                fellows: games.fellows.map(function (x) {
                    return {
                        name: _this.escape(x.name),
                        photoUrl: x.photo,
                        men: x.men,
                        women: x.women,
                        onclick: function () {
                            session.gotoFellow(x.userId);
                            dlg.close();
                        }
                    };
                }),
                tables: games.history.map(function (x) {
                    return {
                        gameId: "" + x.gameId,
                        men: x.men,
                        women: x.women,
                        bottle: x.bottle,
                        onclick: function () {
                            session.gotoHistory(x.gameId);
                            dlg.close();
                        }
                    };
                })
            });
        };
        session.queryFriendGames(this.social.friendIds || []).then(onQuery);
        dlg.open();
    };
    SessionFactory.prototype.showAudioList = function (audioService, receiver) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trans, _a, favSongs, historySongs, search, getFolder, purchase, dlg, resultSource, presentedPreviewMusic, songs, curReq, updateSongs;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trans = this.trans;
                        return [4 /*yield*/, Promise.all([
                                this.session.getMusicFolderService('fav_songs'),
                                this.session.getMusicFolderService('history_songs')
                            ])];
                    case 1:
                        _a = _b.sent(), favSongs = _a[0], historySongs = _a[1];
                        audioService.checkFavorite = function (id) { return favSongs.has(id); };
                        search = utils.throttle(function (query) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var req, result, _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        resultSource = query && query !== '' ? 'search' : 'default';
                                        req = ++curReq;
                                        result = [];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, audioService.search(query)];
                                    case 2:
                                        result = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        updateSongs(req, result);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 500);
                        getFolder = utils.throttle(function (type) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var req, result, songIds, _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        resultSource = type;
                                        req = ++curReq;
                                        result = [];
                                        songIds = (type === 'favourites' ? favSongs : historySongs).songs;
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, audioService.getMusicByIds(songIds)];
                                    case 2:
                                        result = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        updateSongs(req, result);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 500);
                        purchase = function (music) {
                            var price = audioService.musicPrice;
                            _this.showMusicPurchaseConfirmation(false, audioService.confirmationTitleId, music, price, function () {
                                dlg.close();
                                historySongs.mark(music.song_id, true);
                                _this.session.viewerSendMusic(music, price, resultSource, receiver, function (session, gold, reason) {
                                    audioService.showMusicRevert(reason, {
                                        showBase: function () { return _this.showBaseMusicRevert(session, gold); },
                                        showVKSecurity: function (context) { return _this.showVKSecurityMusicRevert(session, gold, context); }
                                    });
                                });
                            });
                        };
                        dlg = this.factory.createMusicListDialog({
                            type: 'audio',
                            title: {
                                default: trans.translate('dlg:music:title'),
                                hot: trans.translate('dlg:music:title:hot'),
                                favourites: trans.translate('dlg:music:title:favourites'),
                                history: trans.translate('dlg:music:title:history'),
                                search: trans.translate('dlg:music:title:search')
                            },
                            subtitle: audioService.legalSubtitle || '',
                            searchHint: trans.translate('dlg:music:search_btn'),
                            emptyTitle: trans.translate('html:dlg:music:empty'),
                            cb: {
                                onpurchase: purchase,
                                onsearch: search,
                            },
                            tabs: audioService.supportsMusicTabs ? {
                                onfavourites: function () { return getFolder('favourites'); },
                                onhistory: function () { return getFolder('history'); },
                                markFavourite: function (id, isFavorite) {
                                    if (isFavorite && !favSongs.hasSpace) {
                                        var dlg_1 = _this.factory.createInfoDialog({
                                            title: trans.translate('dlg:music:favourites_overflow:title'),
                                            context: trans.translate('dlg:music:favourites_overflow:desc'),
                                            hasClose: true,
                                            confirmAction: {
                                                title: trans.translate('dlg:music:favourites_overflow:btn'),
                                                onclick: function (pt) { return dlg_1.close(); }
                                            }
                                        });
                                        dlg_1.open();
                                        return false;
                                    }
                                    else {
                                        favSongs.mark(id, isFavorite);
                                        return true;
                                    }
                                }
                            } : undefined
                        });
                        dlg.onclose = function () {
                            _this.coordinator.stopPreview();
                            _this.coordinator.onpreviewchange = undefined;
                        };
                        resultSource = 'default';
                        songs = [];
                        this.coordinator.onpreviewchange = function () {
                            dlg.setSongPlaying(songs.indexOf(presentedPreviewMusic), false);
                            presentedPreviewMusic = _this.coordinator.previewMusic;
                            dlg.setSongPlaying(songs.indexOf(presentedPreviewMusic), true);
                        };
                        curReq = 0;
                        updateSongs = function (req, response) {
                            if (req !== curReq)
                                return;
                            songs = response;
                            dlg.setSongs(songs.map(function (music) {
                                return {
                                    id: music.song_id,
                                    artist: _this.escape(music.artist),
                                    duration: utils.formatTime(music.duration),
                                    icon: music.icon,
                                    title: _this.escape(music.title),
                                    favourite: music.favourite,
                                    music: music,
                                    play: function () {
                                        if (music === presentedPreviewMusic)
                                            _this.coordinator.stopPreview();
                                        else
                                            _this.coordinator.playPreview(music);
                                    }
                                };
                            }));
                            presentedPreviewMusic = _this.coordinator.previewMusic;
                            if (presentedPreviewMusic)
                                dlg.setSongPlaying(songs.indexOf(presentedPreviewMusic), true);
                        };
                        dlg.open();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showVideoList = function (videoService, receiver) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trans, resultSource, _a, favVideos, historyVideos, search, getFolder, purchase, dlg, updateVideos;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trans = this.trans;
                        resultSource = 'default';
                        return [4 /*yield*/, Promise.all([
                                this.session.getMusicFolderService('fav_videos'),
                                this.session.getMusicFolderService('history_videos')
                            ])];
                    case 1:
                        _a = _b.sent(), favVideos = _a[0], historyVideos = _a[1];
                        videoService.checkFavorite = function (id) { return favVideos.has(id); };
                        search = utils.throttle(function (query) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var result, _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        resultSource = query && query !== '' ? 'default' : 'search';
                                        result = [];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, videoService.search(query)];
                                    case 2:
                                        result = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        updateVideos(result);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 500);
                        getFolder = utils.throttle(function (type) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var result, songIds, _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        resultSource = type;
                                        result = [];
                                        songIds = (type === 'favourites' ? favVideos : historyVideos).songs;
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, videoService.getMusicByIds(songIds)];
                                    case 2:
                                        result = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        updateVideos(result);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 500);
                        purchase = function (music) {
                            var price = videoService.musicPrice;
                            _this.showMusicPurchaseConfirmation(true, videoService.confirmationTitleId, music, price, function () {
                                dlg.close();
                                historyVideos.mark(music.song_id, true);
                                _this.session.viewerSendMusic(music, price, resultSource, receiver, function (session, gold, reason) {
                                    videoService.showMusicRevert(reason, {
                                        showBase: function () { return _this.showBaseMusicRevert(session, gold); },
                                        showVKSecurity: function (context) { return _this.showVKSecurityMusicRevert(session, gold, context); }
                                    });
                                });
                            });
                        };
                        dlg = this.factory.createMusicListDialog({
                            type: 'video',
                            title: {
                                default: trans.translate('dlg:video:title'),
                                hot: trans.translate('dlg:music:title:hot'),
                                favourites: trans.translate('dlg:music:title:favourites'),
                                history: trans.translate('dlg:music:title:history'),
                                search: trans.translate('dlg:music:title:search')
                            },
                            subtitle: '',
                            searchHint: trans.translate('dlg:video:search:hint'),
                            emptyTitle: trans.translate('html:dlg:music:empty'),
                            cb: {
                                onpurchase: purchase,
                                onsearch: search,
                            },
                            tabs: videoService.supportsMusicTabs ? {
                                onfavourites: function () { return getFolder('favourites'); },
                                onhistory: function () { return getFolder('history'); },
                                markFavourite: function (id, isFavorite) {
                                    if (isFavorite && !favVideos.hasSpace) {
                                        var dlg_2 = _this.factory.createInfoDialog({
                                            title: trans.translate('dlg:music:favourites_overflow:title'),
                                            context: trans.translate('dlg:music:favourites_overflow:desc'),
                                            hasClose: true,
                                            confirmAction: {
                                                title: trans.translate('dlg:navigate_vip:btn'),
                                                onclick: function (pt) { return dlg_2.close(); }
                                            }
                                        });
                                        dlg_2.open();
                                        return false;
                                    }
                                    else {
                                        favVideos.mark(id, isFavorite);
                                        return true;
                                    }
                                }
                            } : undefined
                        });
                        updateVideos = function (response) {
                            dlg.setSongs(response.map(function (music) {
                                return {
                                    id: music.song_id,
                                    artist: music.artist,
                                    duration: utils.formatTime(music.duration),
                                    title: _this.escape(music.title),
                                    icon: music.icon,
                                    favourite: music.favourite,
                                    music: music
                                };
                            }));
                        };
                        dlg.open();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showMusicBusyWarning = function () {
        var _this = this;
        var trans = this.trans;
        var context = function () { return trans.translate('dlg:music_busy:msg', _this.escape(_this.coordinator.currentMusicSender.base.name), _this.coordinator.currentMusicSender.base.male, _this.coordinator.leftBusyTimeSec); };
        var dlg = this.factory.createInfoDialog({
            title: trans.translate('dlg:music_busy:title'),
            context: context(),
            confirmAction: {
                title: trans.translate('dlg:music_busy:btn'),
                onclick: function (pt) { return dlg.close(); }
            },
            hasClose: true
        });
        var timer = window.setInterval(function () {
            if (_this.coordinator.leftBusyTimeSec > 0) {
                dlg.setContext(context());
            }
            else {
                dlg.close();
            }
        }, 1000);
        dlg.onclose = function () { return clearInterval(timer); };
        dlg.open();
    };
    SessionFactory.prototype.showMusicPurchaseConfirmation = function (isVideo, dlgTitleId, music, price, onpurchase) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trans, ytPromise, status_1, vidFactory, _a, vidPlayer, context, dlg;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trans = this.trans;
                        ytPromise = isVideo ? this.coordinator.providers[music.provider].prepare(music) : undefined;
                        if (!(isVideo && this.social.ytErrorUrl)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.race([
                                ytPromise,
                                new Promise(function (resolve) {
                                    setTimeout(function () { return resolve('pending'); }, 50);
                                })
                            ])];
                    case 1:
                        status_1 = _b.sent();
                        if (status_1 === 'pending') {
                            this.showYTError(this.social.ytErrorUrl);
                            return [2 /*return*/];
                        }
                        _b.label = 2;
                    case 2:
                        if (!isVideo) return [3 /*break*/, 4];
                        return [4 /*yield*/, ytPromise];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = undefined;
                        _b.label = 5;
                    case 5:
                        vidFactory = _a;
                        vidPlayer = vidFactory ? vidFactory.createPreviewPlayer() : undefined;
                        context = '';
                        if (!isVideo) {
                            context = trans.translate('ios:dlg:music_confirm:desc2', music.artist + " - " + music.title);
                        }
                        else if (vidFactory) {
                            context = trans.translate('dlg:video_preview:context2', music.title);
                        }
                        else {
                            context = trans.translate('ios:dlg:music_confirm:desc2', music.title);
                        }
                        dlg = this.factory.createMusicPreviewDialog({
                            title: trans.translate(dlgTitleId),
                            context: context,
                            price: price,
                            player: vidPlayer ? vidPlayer.el : undefined,
                            oncooldown: function () { return _this.showMusicBusyWarning(); },
                            cancelAction: {
                                name: trans.translate('ios:dlg:music_confirm:cancel'),
                                onclick: function () { return dlg.close(); }
                            },
                            confirmAction: {
                                name: trans.translate('ios:dlg:music_confirm:confirm'),
                                onclick: function () {
                                    dlg.close();
                                    onpurchase && onpurchase();
                                }
                            }
                        });
                        dlg.scope.addInterval(function () {
                            if (_this.coordinator.currentMusic &&
                                _this.coordinator.currentMusicSender !== _this.session.viewer &&
                                _this.coordinator.leftBusyTimeSec > 0) {
                                dlg.setTimer(utils.secondsToHHMMSS(_this.coordinator.leftBusyTimeSec));
                            }
                            else {
                                dlg.setTimer();
                            }
                        }, 1000).call();
                        dlg.onopen = function () {
                            if (vidPlayer) {
                                _this.coordinator.enterMute('ytPreview');
                                vidPlayer.play({ autoPlay: false });
                            }
                        };
                        dlg.onclose = function () {
                            if (vidPlayer) {
                                vidPlayer.destroy();
                                _this.coordinator.leaveMute('ytPreview');
                            }
                        };
                        dlg.open();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showYTError = function (url) {
        var dlg = this.factory.createInfoDialog({
            title: "Проблема с видео",
            context: "Друзья! Возможны проблемы с проигрыванием видео. " +
                "Пока мы делаем всё, что в наших силах, советуем " +
                "попробовать другого провайдера Интернет или " +
                "запустить игру в приложении соцсети.",
            hasClose: true,
            cancelAction: {
                title: "Перейти в приложение",
                onclick: function () {
                    dlg.close();
                    window.open(url, "_blank");
                }
            },
            confirmAction: {
                title: "OK",
                onclick: function (pt) { return dlg.close(); }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.enterGame = function (session, game, enteredAfterWait) {
        var _this = this;
        var animationManager = this.animationManager;
        var assetsJSON = this.assetsJSON;
        var factory = this.factory;
        var root = this.root;
        var imageMetaRegistry = this.imageMetaRegistry;
        var sfx = this.sfx;
        var social = this.social;
        var trans = this.trans;
        var scope = game.scope;
        var supportsEmoji = (function () {
            if (!_this.config.emojiInputVisible)
                return false;
            if (session.viewer.isVip)
                return true;
            if (social.vipOptions(trans))
                return true;
            return false;
        })();
        var gameView = factory.showGameView({
            bottle: session.abTest.bottle,
            hints: {
                bank: trans.translate('table:hint:heart2'),
                bottlePass: trans.translate('dlg:bottle_pass:title'),
                changeTable: trans.translate('table:hint:change_table'),
                fullscreen: trans.translate('table:hint:fullscreen'),
                league: trans.translate('table:hint:league'),
                miscMenu: trans.translate('table:hint:misc'),
                settings: trans.translate('table:hint:settings'),
            },
            translate: {
                btnKiss: trans.translate('game:choose:btn_kiss'),
                btnRefuse: trans.translate('game:choose:btn_kiss_cancel'),
                btnKissFire: trans.translate('game:choose:passion'),
                btnSlap: trans.translate('game:choose:slap'),
                hintChoose: trans.translate('html:game:choose:title'),
                hintNextTurn: trans.translate('game:nextturn'),
                hintNoMen: trans.translate('hint:no_men'),
                hintNoWomen: trans.translate('hint:no_women'),
                hintWillKissBack: trans.translate('game:willkissback'),
                hintWillTheyKiss: trans.translate('game:willtheykiss'),
                rollBigText: trans.translate('game:spin'),
                rollSmallText: trans.translate('game:spins'),
            },
            maxTableScale: imageMetaRegistry.getMaxTableScale()
        }, {
            supportsEmoji: supportsEmoji,
            supportContextMenu: true,
            supportTranslate: this.config.supportsChatTranslation,
            translateLabel: trans.translate('chat:translate:label')
        });
        this.gameView = gameView;
        var tableView = gameView.tableView, chatView = gameView.chatView;
        tableView.setGold(session.viewer.viewer.gold);
        var tablePresenter = new TablePresenter_1.TablePresenter(tableView, animationManager, trans, session.viewer, this.escape, this.locale, false, assetsJSON);
        tablePresenter.playSfx = function (id) { return sfx.play(id); };
        var chatPresenter = new ChatPresenter_1.ChatPresenter(chatView, trans, this.escape, assetsJSON);
        chatPresenter.onhighlighted = function (id, isHighlighted) {
            tablePresenter.toggleHighlightUser(id, isHighlighted);
        };
        chatPresenter.onphoto = function (id) {
            var user = session.getOrCreateUser(id);
            if (!user)
                return;
            _this.showProfile(session, user);
        };
        chatPresenter.achievementsViewModel = this.achievementsViewModel;
        chatPresenter.playSfx = function (id) { return sfx.play(id); };
        chatView.vipLockText = trans.translate('chat:emoji:hint');
        chatView.becomeVipText = trans.translate('chat:emoji:activate');
        scope.addSignal(session.viewer.isChanged, function () {
            chatView.setVip(session.viewer.isVip);
        }).call();
        var giftScrollPosition = 0;
        var gestureScrollPosition = 0;
        var changeTimeout = session.viewer.changeTableTimeoutSec - 1;
        tablePresenter.countdownTableChange(changeTimeout);
        var countdownInterval = window.setInterval(function () {
            changeTimeout -= 1;
            tablePresenter.countdownTableChange(changeTimeout);
            if (changeTimeout < 1)
                clearInterval(countdownInterval);
        }, 1000);
        var createStore = function (type, assets) {
            var _a;
            var store = new GiftListBuilder_1.GiftListBuilder(assets, trans, social, session.viewer, (_a = session.leagueInfo) === null || _a === void 0 ? void 0 : _a.max_league);
            store.scheduled = session.scheduledGifts;
            store.country = session.countryGifts;
            store.onachievementlock = function (image, lock) { return showAchievementLock(type, image, lock); };
            store.onkisslock = function (image, lock) { return showKissLock(type, image, trans.translate('dlg:locked:kiss:desc'), lock); };
            store.onfriendslock = function (image, lock) { return showFriendsLock(type, image, lock); };
            store.onleaguelock = function (image, lock) { return showLeagueLock(type, image, lock); };
            store.onpricelock = function (image, lock) { return showPriceLock(type, image, lock); };
            store.onharempricelock = function (image, lock) { return showHaremPriceLock(type, image, lock); };
            return store;
        };
        var showTops = function (startInterval) {
            var timers = {};
            var dlg = _this.factory.createTopsDialog({
                loadingTitle: trans.translate('dlg:top:title:loading'),
                titles: {
                    total_kisses: trans.translate('dlg:top:title'),
                    dj_score: trans.translate('dlg:top:title:dj'),
                    price: trans.translate('dlg:top:title:price'),
                    harem_price: trans.translate('dlg:top:title:harem_price'),
                    gestures: trans.translate('dlg:top:title:gestures')
                },
                intervalTitles: {
                    daily: trans.translate('dlg:top:daily'),
                    weekly: trans.translate('dlg:top:weekly'),
                    monthly: trans.translate('dlg:top:monthly'),
                    absolute: trans.translate('dlg:top:absolute')
                },
                topBorderLabel: trans.translate('dlg:top:title:border', '<top>'),
                startInterval: startInterval,
                onsection: function (section) {
                    var ts = timers[section];
                    if (!ts)
                        return;
                    var leftTimeSec = Math.round(ts.leftTimeSec);
                    if (leftTimeSec <= 0)
                        return;
                    var message = trans.translate('dlg:top:timer:results_in') + ": " + utils.secondsToShortText(leftTimeSec, trans);
                    _this.showWarning(message, 'timer');
                },
                onuser: function (id) {
                    _this.showProfile(session, session.getOrCreateUser(id));
                },
                onhelp: function (topId) {
                    var helpDlg = _this.factory.createInfoDialog({
                        title: trans.translate("dlg:top:help:" + topId + ":title"),
                        context: trans.translate("dlg:top:help:" + topId + ":text") + "\n\n" + trans.translate('dlg:top:help:text:common'),
                        hasClose: true,
                        confirmAction: {
                            title: trans.translate('dlg:navigate_vip:btn'),
                            onclick: function (pt) { return helpDlg.close(); }
                        }
                    });
                    helpDlg.open();
                }
            });
            dlg.open();
            session.queryTops(TopsModel_1.topsModel.sections).then(function (tops) {
                for (var section in tops) {
                    var s = tops[section];
                    timers[section] = s.resetTs;
                    dlg.setTopSection(section, s.topItems);
                }
                dlg.update();
            });
        };
        var showViewerAchievements = function () {
            _this.showAchievementsList(session.viewer.viewer.achievements, session.viewer, session);
        };
        var showChangeBottle = function () {
            var params = {
                title: trans.translate('dlg:change_bottle:title'),
                receiverName: ''
            };
            var dlg = _this.factory.createChangeBottleDialog(params);
            var bottleStore = createStore('bottle', assetsJSON.bottles);
            bottleStore.onsend = function (receivers, b) {
                session.viewerSendGift(receivers, b);
                dlg.close();
            };
            bottleStore.onviplock = function (image, name) {
                showVipLock('bottle', image, trans.translate('dlg:locked_bottle:vip:desc'));
            };
            bottleStore.build(undefined, dlg);
            dlg.open();
        };
        var showKissLock = function (type, image, description, lock) {
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked_gift:title'),
                description: description,
                type: type,
                image: image,
                lock: lock,
                confirmAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                }
            });
            dlg.scope.addSignal(session.viewer.isChanged, function () {
                var _a;
                var kisses = (_a = session.viewer.viewer) === null || _a === void 0 ? void 0 : _a.totalKisses;
                if (kisses === lock.current)
                    return;
                if (kisses === undefined || kisses >= lock.needed) {
                    dlg.close();
                    return;
                }
                dlg.setLock(tslib_1.__assign(tslib_1.__assign({}, lock), { current: kisses }));
            });
            dlg.open();
        };
        var showFriendsLock = function (type, image, lock) {
            var inviter = _this.social.createInviter('store_locked');
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked_gift_friends:title'),
                description: trans.translate('dlg:locked_gift_friends:content1'),
                type: type,
                image: image,
                lock: lock,
                cancelAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                },
                confirmAction: inviter ? {
                    title: trans.translate('dlg:locked_gift_friends:btn_invite'),
                    onclick: function () {
                        dlg.close();
                        _this.showInviter(inviter);
                    }
                } : {
                    title: trans.translate('dlg:locked_gift_friends:btn'),
                    onclick: function () { return dlg.close(); }
                }
            });
            dlg.open();
        };
        var showLeagueLock = function (type, image, lock) {
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:league_locked_gift:title') + " " + trans.translate("dlg:league:" + lock.needed),
                description: trans.translate('dlg:league_locked_gift:desc'),
                type: type,
                image: image,
                lock: lock,
                cancelAction: {
                    title: trans.translate('dlg:league_locked_gift:btn'),
                    onclick: function () { return dlg.close(); }
                },
                infoAction: {
                    title: trans.translate('mobile:vip:know'),
                    onclick: function () {
                        dlg.close();
                        _this.showLeagueLadder(session, session.viewer, lock.needed);
                    }
                }
            });
            dlg.open();
        };
        var showAchievementLock = function (type, image, lock) {
            var name = trans.translate("achievement:" + lock.id + ":name", session.viewer.base.male);
            var description = (lock.level <= 0)
                ? trans.translate('dlg:locked_gift_achievement:text:nolevel', '<name>')
                : trans.translate('dlg:locked_gift_achievement:text:level', '<name>', lock.level + 1);
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked:achievement:title'),
                name: name,
                description: description,
                type: type,
                image: image,
                cancelAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                },
                infoAction: {
                    title: trans.translate('mobile:vip:know'),
                    onclick: function () {
                        dlg.close();
                        var a = new model_1.Achievement(lock.id, lock.level);
                        _this.showAchievement(session.viewer, a, true);
                    }
                }
            });
            dlg.open();
        };
        var showVipLock = function (type, image, description) {
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked:vip:title'),
                description: description,
                type: type,
                image: image,
                cancelAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                },
                infoAction: {
                    title: trans.translate('mobile:vip:know'),
                    onclick: function () {
                        dlg.close();
                        _this.showVip(session);
                    }
                }
            });
            dlg.open();
        };
        var showPriceLock = function (type, image, lock) {
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked:price:title'),
                description: trans.translate('dlg:locked:price:desc'),
                type: type,
                image: image,
                lock: lock,
                cancelAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                },
                infoAction: {
                    title: trans.translate('mobile:vip:know'),
                    onclick: function () {
                        dlg.close();
                        _this.showProfile(session, session.viewer);
                    }
                }
            });
            dlg.scope.addSignal(session.viewer.isChanged, function () {
                var _a;
                var price = (_a = session.viewer.stats) === null || _a === void 0 ? void 0 : _a.price;
                if (price === lock.current)
                    return;
                if (price === undefined || price >= lock.needed) {
                    dlg.close();
                    return;
                }
                dlg.setLock(tslib_1.__assign(tslib_1.__assign({}, lock), { current: price }));
            });
            dlg.open();
        };
        var showHaremPriceLock = function (type, image, lock) {
            var dlg = _this.factory.createGiftLockedDialog({
                title: trans.translate('dlg:locked:harem_price:title'),
                description: trans.translate('dlg:locked:harem_price:desc'),
                type: type,
                image: image,
                lock: lock,
                cancelAction: {
                    title: trans.translate('dlg:navigate_vip:btn'),
                    onclick: function () { return dlg.close(); }
                },
                infoAction: {
                    title: trans.translate('mobile:vip:know'),
                    onclick: function () {
                        dlg.close();
                        showTops(TopsModel_1.topsModel.getIntervalByName('harem_price', ''));
                    }
                }
            });
            dlg.scope.addSignal(session.viewer.isChanged, function () {
                var _a;
                var haremPrice = (_a = session.viewer.stats) === null || _a === void 0 ? void 0 : _a.harem_price;
                if (haremPrice === lock.current)
                    return;
                if (haremPrice === undefined || haremPrice >= lock.needed) {
                    dlg.close();
                    return;
                }
                dlg.setLock(tslib_1.__assign(tslib_1.__assign({}, lock), { current: haremPrice }));
            });
            dlg.open();
        };
        this.showSendGift = function (receiver) {
            var _a;
            if (receiver.viewer) {
                (_a = _this.showGestures) === null || _a === void 0 ? void 0 : _a.call(_this);
                return;
            }
            tablePresenter.toggleHoverUser(receiver.id, 'profile');
            var params = {
                title: trans.translate('dlg:gift:title', ''),
                receiverName: receiver.music && receiver.music.isDj
                    ? "DJ " + _this.escape(receiver.base.name) || ''
                    : _this.escape(receiver.base.name) || '',
                onaction: function () { return _this.showProfile(session, receiver); },
                multiselect: {
                    title: trans.translate('mobile:dlg:gift:multiselect'),
                    onselectstatechange: function (isSelective) {
                        tablePresenter.isSelective = isSelective;
                        tablePresenter.selectedUsers = [receiver];
                        tablePresenter.toggleHighlightUser(receiver.id, !isSelective);
                        _this.sendGiftSoloReceiver = isSelective ? undefined : receiver;
                        updateStore();
                    },
                    onselectmen: function () { return tablePresenter.selectMen(); },
                    onselectwomen: function () { return tablePresenter.selectWomen(); }
                }
            };
            var dlg = _this.factory.createSendGiftDialog(params);
            var buildStore = function (selectedUsers) {
                for (var _i = 0, musicStoreItems_1 = musicStoreItems; _i < musicStoreItems_1.length; _i++) {
                    var item = musicStoreItems_1[_i];
                    item.addToStore(trans, dlg, selectedUsers);
                }
                giftStore.build(selectedUsers, dlg);
            };
            var updateStore = function () {
                var scrollTop = dlg.getScrollTop();
                dlg.clearItems();
                buildStore(tablePresenter.selectedUsers);
                dlg.update();
                dlg.setScrollTop(scrollTop);
            };
            var giftStore = createStore('gift', assetsJSON.gifts);
            giftStore.onsend = function (receivers, gift) {
                return session.viewerSendGift(tablePresenter.selectedUsers, gift);
            };
            giftStore.onviplock = function (image, name) {
                return showVipLock('gift', image, trans.translate('dlg:locked_gift:vip:desc'));
            };
            tablePresenter.onselectionchange = updateStore;
            tablePresenter.isSelective = false;
            tablePresenter.selectedUsers = [receiver];
            tablePresenter.toggleHighlightUser(receiver.id, true);
            _this.sendGiftSoloReceiver = receiver;
            dlg.scope.addSignal(session.viewer.isChanged, updateStore);
            buildStore([receiver]);
            dlg.onopen = function () { return dlg.setScrollTop(giftScrollPosition); };
            dlg.onclose = function () {
                tablePresenter.onselectionchange = undefined;
                tablePresenter.isSelective = false;
                tablePresenter.toggleHighlightUser(receiver.id, false);
                if (_this.sendGiftSoloReceiver === receiver)
                    _this.sendGiftSoloReceiver = undefined;
                giftScrollPosition = dlg.getScrollTop();
                tablePresenter.toggleHoverUser(receiver.id, 'gift');
            };
            dlg.open();
        };
        this.showGestures = function () {
            var _a;
            tablePresenter.toggleHoverUser(session.viewer.id, 'profile');
            var params = {
                title: trans.translate('dlg:gesture:send'),
                receiverName: '',
                onaction: function () { return _this.showProfile(session, session.viewer); },
                ontokens: function () { return _this.showTokensBank(session); }
            };
            var dlg = _this.factory.createGesturesDialog(params);
            var updateStore = function () {
                var scrollTop = dlg.getScrollTop();
                dlg.clearItems();
                giftStore.build([session.viewer], dlg);
                dlg.update();
                dlg.setScrollTop(scrollTop);
            };
            var giftStore = createStore('gesture', assetsJSON.gestures);
            giftStore.onsend = function (receivers, gesture) {
                return session.viewerSendGift([session.viewer], gesture);
            };
            giftStore.onkisslock = function (image, lock) {
                return showKissLock('gesture', image, trans.translate('dlg:locked_gesture:kiss:desc'), lock);
            };
            giftStore.onviplock = function (image, name) {
                return showVipLock('gesture', image, trans.translate('dlg:locked_gesture:vip:desc', name));
            };
            tablePresenter.toggleHighlightUser(session.viewer.id, true);
            _this.sendGiftSoloReceiver = session.viewer;
            dlg.scope.addSignal(session.viewer.isChanged, updateStore);
            dlg.scope.addSignal(session.viewer.viewer.tokensChanged, function (tokens) {
                dlg.setTokens(tokens);
            }).call(((_a = session.viewer.viewer) === null || _a === void 0 ? void 0 : _a.tokens) || 0);
            giftStore.build([session.viewer], dlg);
            dlg.onopen = function () { return dlg.setScrollTop(gestureScrollPosition); };
            dlg.onclose = function () {
                tablePresenter.toggleHighlightUser(session.viewer.id, false);
                if (_this.sendGiftSoloReceiver === session.viewer)
                    _this.sendGiftSoloReceiver = undefined;
                gestureScrollPosition = dlg.getScrollTop();
                tablePresenter.toggleHoverUser(session.viewer.id, 'gesture');
            };
            dlg.open();
        };
        var inviter = social.createInviter('settings');
        var showDebugOps = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var token, items, _a, _b, _c, _d, _e, _f, _g, dlg;
            var _this = this;
            return tslib_1.__generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        token = new utils.CancellationToken();
                        _b = (_a = []).concat;
                        _c = [window.session === session ? [] : [{
                                    type: 'simple',
                                    icon: 'debug',
                                    name: 'Inject window.session',
                                    action: function () {
                                        window.session = session;
                                    }
                                }],
                            __VK_ODR__ ? [{
                                    type: 'simple',
                                    icon: 'debug',
                                    name: 'eruda.init()',
                                    action: function () {
                                        // tslint:disable-next-line:no-require-imports
                                        var eruda = require('eruda');
                                        eruda.init();
                                    }
                                }] : []];
                        if (!social.rewardedRetention) return [3 /*break*/, 3];
                        _f = (_e = Promise).all;
                        return [4 /*yield*/, social.rewardedRetention(trans)];
                    case 1: return [4 /*yield*/, _f.apply(_e, [(_h.sent())
                                .map(function (task) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var done;
                                var _this = this;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.race([
                                                task.checkDone(),
                                                utils.delay(1000, 'timeout')
                                            ])];
                                        case 1:
                                            done = _a.sent();
                                            return [2 /*return*/, {
                                                    type: 'simple',
                                                    icon: done === 'timeout'
                                                        ? 'email'
                                                        : done
                                                            ? 'checkbox_on'
                                                            : 'checkbox_off',
                                                    name: task.description,
                                                    action: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                        var result;
                                                        return tslib_1.__generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0: return [4 /*yield*/, task.do(token)];
                                                                case 1:
                                                                    result = _a.sent();
                                                                    showAlert(task.description + ": " + result);
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    }); }
                                                }];
                                    }
                                });
                            }); })])];
                    case 2:
                        _d = _h.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _d = [];
                        _h.label = 4;
                    case 4:
                        _c = _c.concat([_d, [
                                {
                                    type: 'simple',
                                    icon: 'debug',
                                    name: 'Contact us',
                                    action: function () { return showFeedbackOps([
                                        'email',
                                        'faq',
                                        'fb_messenger',
                                        'report_error',
                                        'telegram'
                                    ]); }
                                },
                                {
                                    type: 'checkbox',
                                    icon: 'debug',
                                    name: 'Test Server',
                                    enabled: this.config.useTestServer,
                                    onchange: function () {
                                        session.toggleTestServer();
                                    }
                                }
                            ]]);
                        if (!social.debugOptions) return [3 /*break*/, 6];
                        return [4 /*yield*/, social.debugOptions(trans, session.viewer)];
                    case 5:
                        _g = (_h.sent())
                            .map(function (opt) { return ({
                            type: 'simple',
                            name: opt.name,
                            icon: 'debug',
                            action: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var result;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, opt.action()];
                                        case 1:
                                            result = _a.sent();
                                            showAlert(opt.name + ": " + JSON.stringify(result));
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        }); });
                        return [3 /*break*/, 7];
                    case 6:
                        _g = [];
                        _h.label = 7;
                    case 7:
                        items = _b.apply(_a, _c.concat([_g]));
                        dlg = this.factory.createSettingsDialog({
                            title: 'DEBUG',
                            platform: social.platformId,
                            viewerId: session.viewer.id,
                            items: items,
                        });
                        dlg.onclose = function () {
                            token.cancel();
                        };
                        dlg.open();
                        return [2 /*return*/];
                }
            });
        }); };
        var showErrorReportDialog = function () {
            var dlg = _this.factory.createErrorReportDialog({
                title: trans.translate('dlg:settings:report'),
                context: trans.translate('dlg:settings:report:context'),
                placeholder: trans.translate('dlg:settings:report:placeholder'),
                btnTitle: trans.translate('android:dlg:feedback:send'),
                onsend: function (msg) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var event, logs;
                    var _a, _b, _c;
                    return tslib_1.__generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4 /*yield*/, ((_b = (_a = window.Sentry) === null || _a === void 0 ? void 0 : _a.getCurrentHub().getScope()) === null || _b === void 0 ? void 0 : _b.applyToEvent({}))];
                            case 1:
                                event = _d.sent();
                                logs = ((_c = event === null || event === void 0 ? void 0 : event.breadcrumbs) === null || _c === void 0 ? void 0 : _c.map(function (m) {
                                    var s = JSON.stringify(m);
                                    return s.indexOf('error_report') >= 0 ? 'ERROR_REPORT_PLACEHOLDER' : s;
                                })) || [];
                                session.errorReport(msg, logs);
                                dlg.close();
                                return [2 /*return*/];
                        }
                    });
                }); }
            });
            dlg.open();
        };
        var showFeedbackOps = function (ops) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var items, dlg;
            return tslib_1.__generator(this, function (_a) {
                items = ops.map(function (o) {
                    switch (o) {
                        case 'email': return {
                            type: 'link',
                            name: trans.translate('dlg:settings:email'),
                            icon: 'email',
                            href: "mailto:support@ciliz.com?subject=" + [
                                "Platform: " + social.platformId,
                                "social: " + social.id,
                                "id: " + session.viewer.id,
                            ].join(', ')
                        };
                        case 'faq': return {
                            type: 'link',
                            name: trans.translate('dlg:settings:faq'),
                            icon: 'faq',
                            href: 'https://ciliz.zendesk.com/hc/'
                        };
                        case 'fb_messenger': return {
                            type: 'link',
                            name: trans.translate('dlg:settings:messenger'),
                            icon: 'fb',
                            href: 'http://m.me/spinthebottlepage'
                        };
                        // 2021-12-24: disabled due support request
                        //   (not possible to answer on this issues)
                        case 'report_error': return undefined && {
                            type: 'simple',
                            name: trans.translate('dlg:settings:report'),
                            icon: 'error-report',
                            action: function () { return showErrorReportDialog(); }
                        };
                        case 'telegram': return {
                            type: 'link',
                            name: trans.translate('dlg:settings:telegram'),
                            icon: 'telegram',
                            href: 'https://t.me/cilizbot'
                        };
                    }
                }).filter(Boolean);
                dlg = this.factory.createSettingsDialog({
                    title: trans.translate('dlg:settings:contacts'),
                    items: items,
                });
                dlg.open();
                return [2 /*return*/];
            });
        }); };
        var showSettings = function () {
            var dlg = _this.factory.createSettingsDialog({
                title: trans.translate('ios:dlg:settings:title'),
                platform: social.platformId,
                viewerId: session.viewer.id,
                items: [].concat(sfx ? [{
                        type: 'checkbox',
                        name: trans.translate('ios:dlg:settings:sounds'),
                        enabled: _this.env.preferences.isSfxEnabled,
                        icon: 'sound',
                        onchange: function (enabled) {
                            root.sfxManager.enabled = enabled;
                            _this.env.preferences.isSfxEnabled = enabled;
                        }
                    }] : [], _this.coordinator.hasProviders ? [{
                        type: 'checkbox',
                        name: trans.translate('ios:dlg:settings:music'),
                        enabled: _this.coordinator.enabled,
                        icon: 'music',
                        onchange: function (enabled) {
                            _this.coordinator.enabled = enabled;
                        }
                    }] : [], inviter ? [{
                        type: 'simple',
                        name: trans.translate('bank:invite:btn'),
                        icon: 'invite',
                        action: function () {
                            _this.showInviter(inviter);
                        }
                    }] : [], social.settingsOptions(trans, session.viewer), social.screenshotPublisher ? [{
                        type: 'simple',
                        name: trans.translate('dlg:settings:screenshot'),
                        icon: 'screenshot',
                        action: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var pub, screenshot;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        pub = social.screenshotPublisher;
                                        return [4 /*yield*/, this.root.createScreenshot()];
                                    case 1:
                                        screenshot = _a.sent();
                                        if (!screenshot)
                                            return [2 /*return*/];
                                        if (this.root.isFullscreen)
                                            this.root.toggleFullscreen();
                                        return [4 /*yield*/, pub.publish(screenshot)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }
                    }] : [], social.feedbackOps.length > 0 ? [{
                        type: 'simple',
                        name: trans.translate('dlg:settings:contacts'),
                        icon: 'feedback',
                        action: function () { return showFeedbackOps(social.feedbackOps); }
                    }] : [], social.logout ? [{
                        type: 'simple',
                        name: trans.translate('android:settings:logout'),
                        icon: 'exit',
                        action: function () { return session.viewerLogout(); }
                    }] : [], (__DEBUG__
                    || session.abTest.debug
                    || ['125272'].indexOf(session.viewer.id) >= 0)
                    ? [{
                            type: 'simple',
                            name: 'DEBUG',
                            icon: 'debug',
                            action: function () { return showDebugOps(); }
                        }] : [])
            });
            dlg.open();
        };
        var showMessageActions = function (text, sender, timestamp) {
            return new Promise(function (resolve) {
                var items = [
                    sender.isBlocked ? {
                        title: trans.translate('dlg:unblock:title'),
                        icon: 'ignore',
                        action: function () {
                            session.unblockUser(sender.id);
                            dlg.close();
                        }
                    } : {
                        title: trans.translate('dlg:block:title'),
                        icon: 'ignore',
                        action: function () {
                            session.blockUser(sender.id);
                            dlg.close();
                        }
                    },
                    {
                        title: trans.translate('dlg:report_issue:title'),
                        icon: 'complain',
                        action: function () {
                            dlg.close();
                            showSureMessageReport(text, sender, timestamp);
                        }
                    }
                ];
                if (_this.config.supportsChatTranslation && !chatView.hasTranslationButton && chatView.allowedToTranslate(timestamp)) {
                    items.push({
                        title: trans.translate('dlg:translate:title'),
                        icon: 'translate',
                        action: function () {
                            dlg.close();
                            session.translateText(text, timestamp);
                        }
                    });
                }
                var dlg = _this.factory.createMessageActionsDialog({ items: items });
                dlg.onclose = function () { return resolve(); };
                dlg.open();
            });
        };
        var showAlert = function (context) {
            var dlg = _this.factory.createInfoDialog({
                title: 'Alert',
                context: context,
                confirmAction: {
                    title: 'OK',
                    onclick: function (pt) { return dlg.close(); }
                }
            });
            dlg.open();
        };
        var showSureMessageReport = function (text, sender, timestamp) {
            var dlg = _this.factory.createInfoDialog({
                title: trans.translate('dlg:report_issue:title'),
                context: trans.translate('dlg:report_issue:desc', _this.escape(sender.name), _this.escape(text)),
                cancelAction: {
                    title: trans.translate('dlg:report_issue:cancel'),
                    onclick: function (pt) {
                        dlg.close();
                    }
                },
                confirmAction: {
                    title: trans.translate('dlg:report_issue:ok'),
                    onclick: function (pt) {
                        session.reportIssue(timestamp);
                        dlg.close();
                    }
                }
            });
            dlg.open();
        };
        var showEmojiWarning = function (onContinue) {
            var allowedVip = social.vipOptions(trans);
            var dlg = _this.factory.createInfoDialog({
                title: trans.translate('dlg:emoji:title'),
                context: allowedVip
                    ? trans.translate('dlg:emoji:desc2')
                    : trans.translate('dlg:emoji:desc:novip2'),
                cancelAction: onContinue
                    ? {
                        title: trans.translate('dlg:emoji:send2'),
                        onclick: function (pt) {
                            onContinue();
                            dlg.close();
                        }
                    }
                    : undefined,
                confirmAction: allowedVip
                    ? {
                        title: trans.translate('dlg:emoji:subscribe'),
                        onclick: function (pt) {
                            dlg.close();
                            _this.showVip(session);
                        }
                    }
                    : {
                        title: 'OK',
                        onclick: function (pt) {
                            dlg.close();
                        }
                    }
            });
            dlg.open();
        };
        var musicPresenter = {
            chat: function (sender, music, startTs, receiver) {
                if (!_this.coordinator.isSupported(music.provider))
                    return;
                chatPresenter.music(sender, music, receiver);
            },
            start: function (sender, music, startTs, receiver) {
                if (sender.viewer)
                    _this.coordinator.enabled = true;
                _this.coordinator.play(sender, music, startTs);
            },
        };
        var createAudioProviderWithService = function (service) {
            var provider = new AudioProvider(factory, gameView, _this.coordinator, service);
            provider.onplayer = function () {
                _this.showAudioList(service);
            };
            provider.ondj = function (dj) {
                if (dj.viewer)
                    _this.showWarning(trans.translate('warning:self_gift:desc'));
                else
                    _this.showSendGift && _this.showSendGift(dj);
            };
            provider.onstore = function (receiver) {
                if (!audioProvider)
                    return;
                _this.showAudioList(audioProvider.service, receiver);
            };
            return provider;
        };
        var createAudioProvider = function (item) {
            switch (item.type) {
                case 'ciliz':
                    var service = new CilizMusicService_1.CilizMusicService('https://music.ciliz.com/api', session.viewer, social.id);
                    return createAudioProviderWithService(service);
                case 'audio':
                    return createAudioProviderWithService(item.service);
                default:
                    (function (x) {
                        throw new Error("Unknown type: " + JSON.stringify(x));
                    })(item);
            }
        };
        var createYTProvider = function (origin) {
            var viewer = session.viewer;
            var service = new CilizVideoService_1.CilizVideoService('https://youtube.ciliz.com', 'yt');
            service.customParams = {
                user_id: viewer.id,
                user_country: viewer.viewer.ipCountry,
                user_age: viewer.detail.age,
                user_vip: viewer.isVip,
                platform: 'bottle_' + social.id
            };
            var provider = new YTProvider(session, factory, gameView, _this.coordinator, service, origin);
            provider.onplayer = function () {
                _this.showVideoList(service);
            };
            provider.ondj = function (dj) {
                if (dj.viewer)
                    _this.showWarning(trans.translate('warning:self_gift:desc'));
                else
                    _this.showSendGift && _this.showSendGift(dj);
            };
            provider.onstore = function (receiver) {
                if (!videoProvider)
                    return;
                _this.showVideoList(service, receiver);
            };
            return provider;
        };
        // only for playing without any service and bank
        var createOKProvider = function () {
            var service = new CilizVideoService_1.CilizVideoService('https://okvideo.ciliz.com', 'ok');
            var provider = new OKVideoProvider(session, factory, gameView, service, _this.coordinator);
            provider.onplayer = function () {
                _this.showVideoList(service);
            };
            provider.ondj = function (dj) {
                if (dj.viewer)
                    _this.showWarning(trans.translate('warning:self_gift:desc'));
                else
                    _this.showSendGift && _this.showSendGift(dj);
            };
            provider.onstore = function (receiver) {
                if (!videoProvider)
                    return;
                _this.showVideoList(service, receiver);
            };
            return provider;
        };
        var createVideoProvider = function (item) {
            switch (item.type) {
                case 'ok':
                    return createOKProvider();
                case 'yt':
                    return createYTProvider(item.origin);
                /*                default:
                                    ((x: never) => {
                                        throw new Error(`Unknown type: ${JSON.stringify(x)}`);
                                    })(item.type);*/
            }
        };
        var createProvider = function (item) {
            switch (item.type) {
                case 'ciliz':
                case 'audio':
                    return createAudioProvider(item);
                case 'yt':
                case 'ok':
                    return createVideoProvider(item);
                default:
                    (function (x) {
                        throw new Error("Unknown type: " + JSON.stringify(x));
                    })(item);
            }
        };
        var audioProvider = social.audioItem
            ? createAudioProvider(social.audioItem)
            : undefined;
        var videoProvider = social.videoItem
            ? createVideoProvider(social.videoItem)
            : undefined;
        var musicStoreItems = tslib_1.__spreadArrays((videoProvider ? [videoProvider] : []), (audioProvider ? [audioProvider] : []));
        var playbackProviders = tslib_1.__spreadArrays(musicStoreItems, social.playbackItems.map(function (item) { return createProvider(item); }));
        for (var _i = 0, playbackProviders_1 = playbackProviders; _i < playbackProviders_1.length; _i++) {
            var provider = playbackProviders_1[_i];
            this.coordinator.providers[provider.service.id] = provider;
        }
        console.debug('providers:', Object.keys(this.coordinator.providers));
        chatView.onbecomevip = function () {
            if (social.vipOptions(trans))
                _this.showVip(session);
            else
                showEmojiWarning();
        };
        chatPresenter.onvip = function () { return _this.showVip(session); };
        chatPresenter.onnativeapp = function (client) {
            if (client === 'ios')
                window.open(_this.storeUrls.ios, '_blank');
            else if (client === 'android')
                window.open(_this.storeUrls.android, '_blank');
        };
        chatPresenter.onsendgift = function (receiver) { var _a; return (_a = _this.showSendGift) === null || _a === void 0 ? void 0 : _a.call(_this, receiver); };
        chatPresenter.onmsgselected = showMessageActions;
        chatPresenter.ontranslate = function (text, ts) { return session.translateText(text, ts); };
        chatPresenter.onachievement = function (receiver, achievement) { return _this.showAchievement(receiver, achievement); };
        chatPresenter.onsend = function (text, receiver) {
            if (!session.viewer.isVip && utils.containsEmoji(text)) {
                showEmojiWarning(function () {
                    session.viewerSendMessage(receiver, text);
                    chatPresenter.onViewerSendMessage();
                });
            }
            else {
                session.viewerSendMessage(receiver, text);
                chatPresenter.onViewerSendMessage();
            }
        };
        chatPresenter.onrewardedvideo = function () { return _this.showBankWithoutPromo(session); };
        game.chat = chatPresenter;
        game.music = musicPresenter;
        game.table = tablePresenter;
        game.onbottlewarning = function (user) {
            if (user) {
                _this.showWarning(trans.translate('hint:turn_wait_user', _this.escape(user.base.name)));
            }
            else {
                _this.showWarning(trans.translate('hint:turn_wait'));
            }
        };
        scope.addSignal(session.viewer.viewer.onGoldChanged, function (gold, goldReal) {
            tableView.setGold(gold);
        });
        scope.addSignal(session.viewer.viewer.onGoldNeeded, function () {
            _this.showBank(session);
        });
        scope.addSignal(session.viewer.viewer.onTokensNeeded, function () {
            _this.showTokensBank(session);
        });
        tablePresenter.onbottle = function () { return session.viewerBottle(); };
        tablePresenter.onkiss = function (receiverId) { return session.viewerKiss(receiverId); };
        tablePresenter.onrefuse = function (receiverId) { return session.viewerRefuse(receiverId); };
        tablePresenter.onkissfire = function () { return session.itemsUse('kiss_fire'); };
        tablePresenter.onrefuseslap = function () { return session.itemsUse('refuse_slap'); };
        tableView.btnChangeTable.setOnClick(function () {
            if (changeTimeout > 0) {
                _this.showWarning(trans.translate('hint:change_room:waiting', changeTimeout));
            }
            else {
                _this.showChangeTable(session);
            }
        });
        tablePresenter.onuserphoto = function (user) {
            var _a, _b;
            if (user === _this.sendGiftSoloReceiver) {
                _this.showProfile(session, user);
                return;
            }
            if (user.viewer) {
                (_a = _this.showGestures) === null || _a === void 0 ? void 0 : _a.call(_this);
            }
            else {
                (_b = _this.showSendGift) === null || _b === void 0 ? void 0 : _b.call(_this, user);
            }
        };
        tablePresenter.onusername = function (user) {
            chatPresenter.receiver = user;
        };
        tableView.btnHeart.setOnClick(function () { return _this.showBank(session); });
        if (social.vipOptions(trans)) {
            scope.addSignal(session.viewer.viewer.tokensVipTsChanged, function () {
                tablePresenter.toggleHeartAnimation(Boolean(session.viewer.isVip &&
                    session.viewer.viewer &&
                    session.viewer.viewer.tokensVipTs.leftTimeSec <= 0));
            }).call();
        }
        tableView.btnSettings.setOnClick(showSettings);
        switch (this.config.fullscreenMod) {
            case 'none':
                tableView.btnFullscreen && tableView.btnFullscreen.setActive(false);
                break;
            case 'settings':
                tableView.btnFullscreen && tableView.btnFullscreen.setActive(false);
                scope.addSignal(this.root.onFullscreenChanged, function () {
                    chatView.followEnd();
                });
                break;
            case 'table':
                scope.addSignal(this.root.onFullscreenChanged, function () {
                    tableView.toggleFullscreen(_this.root.isFullscreen);
                    chatView.followEnd();
                });
                tableView.toggleFullscreen(this.root.isFullscreen);
                if (tableView.btnFullscreen) {
                    tableView.btnFullscreen.setActive(true);
                    tableView.btnFullscreen.setOnClick(function () { return _this.root.toggleFullscreen(); });
                }
                break;
        }
        var isNewAchievement = session.newAchievementsMs !== undefined && Boolean(this.getUserAchievements(session.viewer, session.viewer.viewer ? session.viewer.viewer.achievements : [])
            .filter(function (f) { return f.isNew(session.newAchievementsMs); })[0]);
        tablePresenter.toggleMiscMenuIndicator(isNewAchievement);
        tableView.btnMiscMenu.setOnClick(function () {
            var items = [
                {
                    title: trans.translate('table:hint:achievement'),
                    icon: 'achievements',
                    indicate: isNewAchievement,
                    action: function () {
                        dlg === null || dlg === void 0 ? void 0 : dlg.close();
                        showViewerAchievements();
                    }
                },
                {
                    title: trans.translate('table:hint:top'),
                    icon: 'tops',
                    indicate: false,
                    action: function () {
                        dlg === null || dlg === void 0 ? void 0 : dlg.close();
                        showTops();
                    }
                },
                {
                    title: trans.translate('table:menu:change_bottle'),
                    icon: 'bottle',
                    indicate: false,
                    action: function () {
                        dlg === null || dlg === void 0 ? void 0 : dlg.close();
                        showChangeBottle();
                    }
                },
                {
                    title: trans.translate('table:menu:decor'),
                    icon: 'decor',
                    indicate: false,
                    action: function () {
                        dlg === null || dlg === void 0 ? void 0 : dlg.close();
                        _this.showDecorSelection(session);
                    }
                },
                {
                    title: trans.translate('table:menu:boosters'),
                    icon: 'boosters',
                    indicate: false,
                    action: function () {
                        dlg === null || dlg === void 0 ? void 0 : dlg.close();
                        _this.showBoostersList(session);
                    }
                }
            ];
            var dlg = _this.factory.createMiscMenuDialog({
                items: items,
                btnCenterPoint: function () { return tableView.animationLayerToGlobal(tableView.btnMiscMenu.centerPoint); }
            });
            if (!dlg)
                return;
            dlg.open();
        });
        var updateBtnLeague = function () {
            var info = session.leagueInfo;
            if (!info) {
                tableView.setLeagueInfo({ type: 'unknown' });
                return;
            }
            session.resetLeagueTimeUpdater();
            tableView.toggleLeagueLimitIndicator(false);
            switch (info.state) {
                case 'welcome':
                    tableView.setLeagueInfo({ type: 'welcome' });
                    break;
                case 'running':
                    session.setLeagueTimeUpdater(function () {
                        if (info.state !== 'running' || !info.finishTs) {
                            session.resetLeagueTimeUpdater();
                            return;
                        }
                        var leftTimeSec = Math.max(0, Math.round(info.finishTs.leftTimeSec));
                        var position = info.users.map(function (u) { return u.id; }).indexOf(session.viewer.id) + 1;
                        tableView.setLeagueInfo({
                            type: 'running',
                            positionText: trans.translate('table:league_btn_num', position),
                            leftTimeShortText: utils.secondsToShortText(leftTimeSec, trans)
                        });
                    });
                    tableView.toggleLeagueLimitIndicator(info.limitNotify);
                    break;
                case 'finished': {
                    var position = info.users.map(function (u) { return u.id; }).indexOf(session.viewer.id) + 1;
                    tableView.setLeagueInfo({
                        type: 'finished',
                        positionText: trans.translate('table:league_btn_num', position)
                    });
                    break;
                }
                case 'idle':
                case undefined:
                    break;
                default:
                    (function (x) { })(info.state);
            }
        };
        scope.addSignal(session.onLeagueUpdate, updateBtnLeague);
        scope.addSignal(session.onPassUpdate, function () {
            var info = session.passInfo;
            var disableBtn = function () {
                tableView.btnBottlePass.setActive(false);
                tableView.setBottlePassInfo();
            };
            if (!info || info.state === 'undefined') {
                disableBtn();
                return;
            }
            session.resetPassTimeUpdater();
            var indicate = function () {
                return (info.state === 'finished' && info.pass_premium && info.chest.gold > 0 && !info.chest.claimed) ||
                    info.levels.some(function (f) {
                        if (f.level > info.level)
                            return false;
                        if (f.startTs.leftTime > 0)
                            return false;
                        if (info.pass_premium)
                            return !Boolean(f.paid.claimed) || !Boolean(f.free.claimed);
                        return !Boolean(f.free.claimed);
                    });
            };
            tableView.toggleBottlePassIndicator(indicate());
            tableView.btnBottlePass.setActive(true);
            switch (info.state) {
                case 'announce':
                case 'running':
                case 'pending_reward':
                    session.setPassTimeUpdater(function () {
                        if (!session.isPassRunning || !info.finishTs || info.finishTs.leftTime < 1) {
                            tableView.setBottlePassInfo();
                            session.resetPassTimeUpdater();
                            return;
                        }
                        var leftTimeSec = Math.max(0, Math.round(info.finishTs.leftTimeSec));
                        tableView.setBottlePassInfo(utils.secondsToShortText(leftTimeSec, trans));
                        tableView.toggleBottlePassIndicator(indicate());
                    });
                    break;
                case 'finished':
                    tableView.setBottlePassInfo();
                    session.resetPassTimeUpdater();
                    break;
                default:
                    (function (x) { })(info.state);
            }
        }).call();
        if (tableView.btnLeague) {
            tableView.btnLeague.setOnClick(function () {
                var warningText = trans.translate('dlg:league:undefined');
                if (!session.leagueInfo) {
                    _this.showWarning(warningText);
                    return;
                }
                switch (session.leagueInfo.state) {
                    case 'welcome':
                        _this.showLeagueWelcome(session);
                        break;
                    case 'running':
                        _this.showLeague(session);
                        break;
                    case 'finished':
                        // do nothing, showLeagueFinish is triggered from server
                        break;
                    case 'idle':
                        _this.showLeagueLocked(session);
                        break;
                    case undefined:
                        _this.showWarning(warningText);
                        break;
                    default:
                        (function (x) { })(session.leagueInfo.state);
                }
            });
            updateBtnLeague();
        }
        tableView.btnBottlePass.setOnClick(function () { return _this.showBottlePass(session); });
        scope.addSignal(session.viewer.isChanged, function () {
            var _a, _b;
            var format = function (count) {
                if (!count || count < 1)
                    return '0';
                if (count > 99)
                    return '99+';
                return "" + count;
            };
            var items = session.viewer.viewer.items;
            tableView.setBoosterCounter({
                kiss_fire: format((_a = items.kiss_fire) !== null && _a !== void 0 ? _a : 0),
                refuse_slap: format((_b = items.refuse_slap) !== null && _b !== void 0 ? _b : 0)
            });
        }).call();
        var trackClickEvent = function (type) { return _this.session.trackEvent('clicker', type, undefined, 0); };
        tableView.bottle.ontrack = utils.clickAntibotFilter(trackClickEvent);
        tableView.btnKiss.ontrack = utils.clickAntibotFilter(trackClickEvent);
        tableView.btnRefuse.ontrack = utils.clickAntibotFilter(trackClickEvent);
        tableView.btnKissFire.ontrack = utils.clickAntibotFilter(trackClickEvent);
        tableView.btnRefuseSlap.ontrack = utils.clickAntibotFilter(trackClickEvent);
        scope.addBlock(function () {
            _this.chatPresenter = chatPresenter;
            _this.tablePresenter = tablePresenter;
            return function () {
                animationManager.complete(true);
                _this.chatPresenter = undefined;
                _this.tablePresenter.destroy();
                _this.tablePresenter = undefined;
                _this.coordinator.reset();
                _this.factory.showEmptyView();
                _this.root.dialogManager.closeAll();
                _this.gameView = undefined;
            };
        });
        if (enteredAfterWait)
            sfx.play('door_open');
    };
    SessionFactory.prototype.showContentUnlock = function (session, filter, items, gold) {
        var gestures = utils.array.flatten(this.assetsJSON.gestures.__store).filter(function (f) { return items.indexOf(f.id) !== -1; });
        if (gestures.length > 0) {
            this.showNewGesture(items[0]);
            return;
        }
        var gifts = utils.array.flatten(this.assetsJSON.gifts.__store).filter(function (f) { return items.indexOf(f.id) !== -1; });
        if (gifts.length === 0) {
            var FORTHCOMING_IDS_1 = utils.array.flatten(tslib_1.__spreadArrays((this.assetsJSON.gestures.__store_v2 || []), (this.assetsJSON.gifts.__store_v5 || []))).map(function (g) { return g.id; });
            var unknownIds = items.filter(function (id) { return FORTHCOMING_IDS_1.indexOf(id) < 0; });
            if (unknownIds.length > 0) {
                throw new Error("No such content: " + JSON.stringify(items) + " " + JSON.stringify(unknownIds));
            }
            return;
        }
        this.showNewGifts(session, filter, gifts, gold);
    };
    SessionFactory.prototype.showNewGifts = function (session, filter, items, gold) {
        var _this = this;
        var viewer = session.viewer;
        var trans = this.trans;
        var gifts = items.map(function (m) {
            var g = _this.assetsJSON.gifts[m.id];
            return {
                id: m.id,
                image: g.storeImage,
                name: trans.translate(g.category + ":" + g.type),
                vkMedia: g.vkMedia,
                isTemp: false,
                isBottle: false
            };
        });
        var isShared = false;
        var claim = function (pt) {
            dlg.close();
            if (gold && isShared) {
                session.claimKissBonus();
                _this.addViewerGold(session, gold, 0, pt);
            }
        };
        var description = function () {
            switch (filter.type) {
                case 'total_kisses':
                    return trans.translate('dlg:unlocked:total_kisses:desc', viewer.base.male);
                case 'price':
                    return trans.translate('dlg:unlocked:price:desc');
                case 'harem_price':
                    return trans.translate('dlg:unlocked:harem_price:desc');
                default:
                    (function (x) { })(filter);
                    return '';
            }
        };
        var shareGift = gifts[0];
        var dlg = this.factory.createGiftUnlockedDialog({
            title: trans.translate('dlg:unlocked:gift:title', gifts.length),
            reason: {
                type: filter.type,
                description: description(),
                price: filter.value
            },
            subdescription: trans.translate('dlg:unlocked:gift:subdesc', gifts.length),
            hint: trans.translate('dlg:level_up:content3'),
            checkboxLabel: shareGift.vkMedia ? trans.translate('dlg:scheduled:share') : '',
            items: gifts,
            btnTitle: trans.translate('dlg:level_up:btn_continue'),
            btnBonus: gold,
            onaction: function (pt, isPost) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (isShared)
                                return [2 /*return*/];
                            isShared = true;
                            if (!isPost || !shareGift.vkMedia) {
                                claim(pt);
                                return [2 /*return*/];
                            }
                            if (!(this.social instanceof VKSocial_1.VKSocial)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.social.shareVKLevelUp(shareGift.name, shareGift.vkMedia)];
                        case 1:
                            _a.sent();
                            claim(pt);
                            return [3 /*break*/, 5];
                        case 2:
                            if (!this.social.shareLevelUp) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.social.shareLevelUp(trans.translate('dlg:level_up:title'), trans.translate('gift:share', viewer.base.male, shareGift.name), shareGift.id)];
                        case 3:
                            _a.sent();
                            claim(pt);
                            return [3 /*break*/, 5];
                        case 4:
                            claim(pt);
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            }); }
        });
        dlg.open();
    };
    SessionFactory.prototype.showNewGesture = function (gesture) {
        var trans = this.trans;
        var dlg = this.factory.createNewGestureDialog({
            title: trans.translate('dlg:kiss_bonus:title'),
            image: this.assetsJSON.gestures[gesture].storeImage,
            context: trans.translate('dlg:gesture:context', trans.translate("gesture:" + gesture)),
            description: trans.translate('dlg:gesture:desc'),
            action: {
                name: trans.translate('dlg:gold:btn'),
                onclick: function () { return dlg.close(); }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showNewAchievement = function (session, achievement, bonus) {
        var _this = this;
        var viewer = session.viewer;
        var avm = this.achievementsViewModel.get(achievement, viewer);
        var isShared = false;
        var claim = function (pt) {
            dlg.close();
            session.claimAchievementBonus(achievement.id, bonus, isShared);
            if (isShared)
                _this.addViewerGold(session, bonus, 0, pt);
            _this.showNewAchievementGifts(session, avm);
        };
        var onAction = function (pt, isPost) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isShared)
                            return [2 /*return*/];
                        isShared = true;
                        if (!(this.social.shareAchievement && isPost)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.social.shareAchievement(avm.share)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        claim(pt);
                        return [2 /*return*/];
                }
            });
        }); };
        var trans = this.trans;
        var dlg = this.factory.createAchievementDialog({
            title: trans.translate('dlg:kiss_bonus:title'),
            subtitle: achievement.id === 'recorder'
                ? trans.translate('achievement:congratulation:recorder2', this.escape(viewer.base.name), viewer.base.male)
                : trans.translate('achievement:congratulation2'),
            name: avm.name,
            term: avm.term,
            image: avm.image,
            level: avm.level,
            maxLevel: avm.maxLevel,
            disabled: avm.disabled,
            bonus: {
                checkboxLabel: this.social.shareAchievement && trans.translate('dlg:scheduled:share'),
                title: trans.translate('dlg:achievement:btn_continue'),
                bonus: bonus > 0 ? bonus : undefined,
                onaction: onAction
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showNewAchievementGifts = function (session, avm) {
        var _this = this;
        var trans = this.trans;
        var store = utils.array.flatten(this.assetsJSON.gifts.__store);
        var gvms = [];
        for (var _i = 0, store_1 = store; _i < store_1.length; _i++) {
            var item = store_1[_i];
            if (!item.achievement_s)
                continue;
            if (item.achievement_s.id !== avm.id)
                continue;
            if (Math.max(item.achievement_s.level, 0) !== Math.max(avm.level, 0))
                continue;
            var g = this.assetsJSON.gifts[item.id];
            gvms.push({
                id: item.id,
                image: g.storeImage,
                name: trans.translate(g.category + ":" + g.type),
                vkMedia: g.vkMedia
            });
        }
        if (gvms.length === 0)
            return;
        var dlg = this.factory.createGiftUnlockedDialog({
            title: trans.translate('dlg:level_up:title'),
            reason: {
                type: 'achievement',
                description: trans.translate('dlg:unlocked:achievement:desc', avm.name)
            },
            subdescription: trans.translate('dlg:level_up:content2'),
            hint: trans.translate('dlg:level_up:content3'),
            items: gvms.map(function (gvm) {
                return {
                    image: gvm.image,
                    isTemp: false,
                    isBottle: false
                };
            }),
            btnTitle: trans.translate('dlg:level_up:btn_continue'),
            onaction: function (pt) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var g;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            dlg.close();
                            if (!(this.social instanceof VKSocial_1.VKSocial)) return [3 /*break*/, 2];
                            g = gvms[0];
                            if (!g.vkMedia)
                                throw new Error("No vkMedia for level up: " + g.id);
                            return [4 /*yield*/, this.social.shareVKLevelUp(g.name, g.vkMedia)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); }
        });
        dlg.open();
    };
    SessionFactory.prototype.startPreload = function (session, abTest) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var giftsJSON, storeJSON, items, _i, storeJSON_1, storeItemJSON, item, gesturesJSON, gesturesIds, _a, gesturesIds_1, id, item, bottleJSON, bottleIds, _b, bottleIds_1, id, item, tasks, _loop_2, _c, items_1, item, _d, items_2, item, _loop_3, _e, _f, image, _loop_4, _g, _h, bottle, _loop_5, _j, _k, spine, _loop_6, _l, _m, image, limit, _o;
            var _this = this;
            return tslib_1.__generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        giftsJSON = this.assetsJSON.gifts;
                        storeJSON = [].concat(session.scheduledGifts, session.countryGifts, utils.array.flatten(giftsJSON.__store));
                        items = [];
                        for (_i = 0, storeJSON_1 = storeJSON; _i < storeJSON_1.length; _i++) {
                            storeItemJSON = storeJSON_1[_i];
                            item = storeItemJSON.id && giftsJSON[storeItemJSON.id];
                            if (!item)
                                continue;
                            items.push({
                                store: item.storeImage,
                                images: [].concat(item.flyImages, item.stickImages).filter(Boolean),
                                spines: item.spine
                            });
                        }
                        gesturesJSON = this.assetsJSON.gestures;
                        gesturesIds = utils.array.flatten(gesturesJSON.__store)
                            .map(function (_a) {
                            var id = _a.id;
                            return id;
                        })
                            .filter(Boolean);
                        for (_a = 0, gesturesIds_1 = gesturesIds; _a < gesturesIds_1.length; _a++) {
                            id = gesturesIds_1[_a];
                            item = gesturesJSON[id];
                            if (!item)
                                continue;
                            items.push({
                                store: item.storeImage,
                                images: [item.image],
                                spines: [item.spine]
                            });
                        }
                        bottleJSON = this.assetsJSON.bottles;
                        bottleIds = utils.array.flatten(bottleJSON.__store)
                            .map(function (_a) {
                            var id = _a.id;
                            return id;
                        })
                            .filter(Boolean);
                        for (_b = 0, bottleIds_1 = bottleIds; _b < bottleIds_1.length; _b++) {
                            id = bottleIds_1[_b];
                            item = bottleJSON[id];
                            if (!item)
                                continue;
                            items.push({
                                store: item.image,
                                images: [item.image],
                                bottle3d: item.bottle3d ? [item.bottle3d] : undefined
                            });
                        }
                        tasks = [
                            function () { return _this.imageLoader.preloadDialogImage('g_music'); },
                            function () { return _this.imageLoader.preloadDialogImage('g_video'); }
                        ];
                        _loop_2 = function (item) {
                            tasks.push(function () { return _this.imageLoader.preloadDialogImage(item.store); });
                        };
                        for (_c = 0, items_1 = items; _c < items_1.length; _c++) {
                            item = items_1[_c];
                            _loop_2(item);
                        }
                        for (_d = 0, items_2 = items; _d < items_2.length; _d++) {
                            item = items_2[_d];
                            switch (this.root.tableVersion) {
                                case 'v1':
                                    _loop_3 = function (image) {
                                        tasks.push(function () { return _this.imageLoader.preloadTableImage(image); });
                                    };
                                    for (_e = 0, _f = item.images; _e < _f.length; _e++) {
                                        image = _f[_e];
                                        _loop_3(image);
                                    }
                                    break;
                                case 'v2':
                                    if (abTest.bottle === '3d' && item.bottle3d) {
                                        _loop_4 = function (bottle) {
                                            tasks.push(function () { return _this.imageLoader.preloadPixiBottle3d(bottle); });
                                        };
                                        for (_g = 0, _h = item.bottle3d; _g < _h.length; _g++) {
                                            bottle = _h[_g];
                                            _loop_4(bottle);
                                        }
                                    }
                                    else if (item.spines) {
                                        _loop_5 = function (spine) {
                                            tasks.push(function () { return _this.imageLoader.preloadPixiSpine(spine); });
                                        };
                                        for (_j = 0, _k = item.spines; _j < _k.length; _j++) {
                                            spine = _k[_j];
                                            _loop_5(spine);
                                        }
                                    }
                                    else {
                                        _loop_6 = function (image) {
                                            tasks.push(function () { return _this.imageLoader.preloadPixiImage(image); });
                                        };
                                        for (_l = 0, _m = item.images; _l < _m.length; _l++) {
                                            image = _m[_l];
                                            _loop_6(image);
                                        }
                                    }
                                    break;
                                default:
                                    (function (x) { })(this.root.tableVersion);
                            }
                        }
                        _p.label = 1;
                    case 1:
                        _p.trys.push([1, 3, , 4]);
                        limit = 6;
                        return [4 /*yield*/, utils.concurrency(tasks, limit)];
                    case 2:
                        _p.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _o = _p.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.onSendGift = function (session, sender, receiver, giftId) {
        var _this = this;
        var _a;
        if (!receiver.viewer || !this.config.enableResponseGiftDialog)
            return;
        if (this.responseGiftState.type === 'dialog') {
            if (this.responseGiftState.sender.id === sender.id)
                this.responseGiftState.dialog.updateImage(this.assetsJSON.gifts[giftId].storeImage);
            return;
        }
        if (this.responseGiftState.type === 'onhold')
            return;
        var dialog = this.factory.createResponseGiftDialog({
            name: this.escape(sender.name),
            nameColor: sender.color,
            photoUrl: sender.photoUrl,
            premium: sender.isPremium,
            message: this.trans.translate('chat:gift_response:text', sender.base.male),
            gift: this.assetsJSON.gifts[giftId].storeImage,
            topOffset: this.gameView && this.gameView.musicView ? (_a = this.gameView.musicView) === null || _a === void 0 ? void 0 : _a.height : 0,
            confirmAction: {
                name: this.trans.translate('chat:gift_response:btn'),
                onclick: function (pt) {
                    var _a;
                    if (_this.responseGiftState.type !== 'dialog')
                        throw new Error("Incorrect state: " + _this.responseGiftState.type);
                    if (_this.responseGiftState.dialog !== dialog)
                        throw new Error("Incorrect dialog");
                    _this.responseGiftState.dialog.close();
                    (_a = _this.showSendGift) === null || _a === void 0 ? void 0 : _a.call(_this, _this.responseGiftState.sender);
                    _this.responseGiftState = { type: 'ready' };
                }
            },
            closeAction: function (pt) {
                if (_this.responseGiftState.type !== 'dialog')
                    throw new Error("Incorrect state: " + _this.responseGiftState.type);
                if (_this.responseGiftState.dialog !== dialog)
                    throw new Error("Incorrect dialog");
                _this.responseGiftState.dialog.close();
                _this.responseGiftState = { type: 'onhold' };
                session.schedule(function () {
                    if (_this.responseGiftState.type !== 'onhold')
                        throw new Error("Incorrect state: " + _this.responseGiftState.type);
                    _this.responseGiftState = { type: 'ready' };
                }, 5 * 60 * 1000);
            }
        });
        if (!dialog)
            return;
        if (this.gameView) {
            dialog.scope.addSignal(this.gameView.onLayoutChanged, function () { var _a; return dialog.setTopOffset(_this.gameView && _this.gameView.musicView ? (_a = _this.gameView.musicView) === null || _a === void 0 ? void 0 : _a.height : 0); });
        }
        this.responseGiftState = {
            type: 'dialog',
            sender: sender,
            dialog: dialog
        };
        dialog.open();
        session.schedule(function () {
            if (_this.responseGiftState.type !== 'dialog')
                return; // user has already closed
            if (_this.responseGiftState.dialog !== dialog)
                return; // new dialog is on screen
            if (!_this.responseGiftState.dialog.isOpened)
                return; // user change table
            _this.responseGiftState.dialog.close();
            _this.responseGiftState = { type: 'ready' };
        }, 30 * 1000);
    };
    SessionFactory.prototype.showLeagueHelp = function () {
        var trans = this.trans;
        var dlg = this.factory.createLeagueHelpDialog({
            title: trans.translate('dlg:league:manual:title'),
            page1: trans.translate('league:help:page1'),
            page2: {
                desc: trans.translate('league:help:page2:text1'),
                list: {
                    gift: trans.translate('league:help:page2:text2'),
                    kiss: trans.translate('league:help:page2:text3'),
                    music: trans.translate('league:help:page2:text4'),
                    lock: trans.translate('league:help:page2:text5')
                },
                hint: trans.translate('league:help:page2:text6')
            },
            page3: trans.translate('league:help:page3'),
            page4: trans.translate('league:help:page4')
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeagueLocked = function (session) {
        var _this = this;
        if (!session.leagueInfo)
            return;
        var trans = this.trans;
        var dlg = this.factory.createLeagueMoveDialog({
            title: trans.translate('dlg:league:idle:title'),
            description: trans.translate("dlg:league:" + session.leagueInfo.league),
            leagueEvent: {
                type: 'locked',
                cupImage: this.assetsJSON.leagues[session.leagueInfo.league].image,
            },
            btnTitle: trans.translate('dlg:harem:btn'),
            hasClose: true,
            onaction: function () { return dlg.close(); },
            onhelp: function () { return _this.showLeagueHelp(); }
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeagueRewardInfo = function (finished, prize, league, position) {
        var dlg = this.factory.createRewardInfoDialog({
            title: position
                ? this.trans.translate(finished ? 'dlg:league:desc:prize_finish' : 'dlg:league:desc:prize', position)
                : this.trans.translate("dlg:league:" + league),
            subtitle: finished ? this.trans.translate('dlg:league:desc:prize_subtitle') : undefined,
            position: position && position < 4 ? position : 'regular',
            prize: prize
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeagueLadder = function (session, user, userLeague) {
        var _this = this;
        if (!session.leagueInfo)
            return;
        var leagueInfo = session.leagueInfo;
        var trans = this.trans;
        var dlg = this.factory.createLeagueLadderDialog({
            title: trans.translate('dlg:league:ladder:title'),
            description: trans.translate('dlg:league:ladder:desc'),
            leagues: Object.keys(this.assetsJSON.leagues)
                .slice(0, leagueInfo.max_league + 2)
                .reverse()
                .map(function (l) {
                var leagueNum = Number(l);
                var prevLeague = _this.assetsJSON.leagues[leagueNum - 1];
                var gifts = prevLeague && prevLeague.gifts
                    ? prevLeague.gifts.map(function (g) {
                        return _this.assetsJSON.gifts[g].storeImage;
                    })
                    : [];
                var frame = prevLeague && prevLeague.frame
                    ? _this.assetsJSON.frames[prevLeague.frame].storeImage_v2
                    : undefined;
                var stone = prevLeague && prevLeague.stone
                    ? _this.assetsJSON.stones[prevLeague.stone].storeImage
                    : undefined;
                var stateTitle;
                var state;
                var users = [];
                if (leagueInfo.league === leagueNum) {
                    state = 'current-viewer';
                    users.push({
                        name: session.viewer.name,
                        photoUrl: session.viewer.photoUrl,
                    });
                }
                if (!user.viewer && userLeague === leagueNum) {
                    state = 'current-user';
                    users.push({
                        name: user.name,
                        photoUrl: user.photoUrl,
                    });
                }
                if (leagueNum > leagueInfo.max_league) {
                    gifts = [];
                    frame = undefined;
                    stone = undefined;
                    state = 'inprogress';
                    stateTitle = trans.translate('dlg:league:ladder:in_dev');
                }
                var prize = { gifts: gifts, frame: frame, stone: stone };
                return {
                    title: trans.translate("dlg:league:" + leagueNum),
                    icon: _this.assetsJSON.leagues[leagueNum].image,
                    stateTitle: stateTitle,
                    state: state,
                    users: users,
                    oninfo: gifts.length > 0 || frame || stone ? function () { return _this.showLeagueRewardInfo(false, prize, leagueNum); } : undefined
                };
            })
        });
        dlg.scope.addSignal(session.onLeagueUpdate, function () {
            var _a;
            if (((_a = session.leagueInfo) === null || _a === void 0 ? void 0 : _a.state) === 'finished')
                dlg.close();
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeague = function (session) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var leagueInfo, trans, isFinished, dlgTimers, dlg, update;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!session.leagueInfo)
                            return [2 /*return*/];
                        leagueInfo = session.leagueInfo;
                        trans = this.trans;
                        isFinished = leagueInfo.state === 'finished';
                        dlgTimers = {};
                        dlg = this.factory.createLeagueDialog({
                            title: trans.translate("dlg:league:" + leagueInfo.league),
                            descUp: trans.translate('dlg:league:desc:up'),
                            descStay: trans.translate('dlg:league:desc:stay'),
                            descDown: trans.translate('dlg:league:desc:down'),
                            info: {
                                description: isFinished
                                    ? trans.translate('dlg:league_finish:desc')
                                    : trans.translate('dlg:league:desc:boosters'),
                                cupImage: this.assetsJSON.leagues[leagueInfo.league].image,
                                cupBg: isFinished ? 'finish' : 'altar',
                                onladder: isFinished
                                    ? undefined
                                    : function () { return _this.showLeagueLadder(session, session.viewer, session.league); }
                            },
                            boostersTitle: this.trans.translate('table:menu:boosters'),
                            boostersActive: this.leagueDlgBoostersActive,
                            onhelp: function () { return _this.showLeagueHelp(); },
                            onuser: function (id) {
                                _this.showProfile(session, session.getOrCreateUser(id));
                            },
                            onlimit: function () {
                                var _a;
                                if (!leagueInfo.limit)
                                    return;
                                leagueInfo.limitNotify = false;
                                (_a = _this.tablePresenter) === null || _a === void 0 ? void 0 : _a.toggleLeagueLimitIndicator(false);
                                var dlg = _this.factory.createLeagueLimitDialog({
                                    limit: leagueInfo.limit,
                                    title: trans.translate('dlg:league:limit:title'),
                                    limitGiftText: trans.translate('dlg:league:limit:gift'),
                                    limitKissText: trans.translate('dlg:league:limit:kiss'),
                                    btnTitle: trans.translate('dlg:top:help:ok')
                                });
                                dlg.open();
                            }
                        });
                        update = function () {
                            if (!isFinished && leagueInfo.state === 'finished') {
                                dlg.close();
                                return;
                            }
                            var users = leagueInfo.users.map(function (u, i) {
                                var _a;
                                var gifts = i < leagueInfo.move_up ? leagueInfo.gifts.map(function (g) { return _this.assetsJSON.gifts[g].storeImage; }) : [];
                                var gold = leagueInfo.gold[i];
                                var tokens = leagueInfo.tokens[i];
                                var league = _this.assetsJSON.leagues[leagueInfo.league];
                                var frame = i < leagueInfo.move_up && league.frame
                                    ? _this.assetsJSON.frames[league.frame].storeImage_v2
                                    : undefined;
                                var stone = i < leagueInfo.move_up && league.stone
                                    ? _this.assetsJSON.stones[league.stone].storeImage
                                    : undefined;
                                var boosters = json_1.BOOSTERS.map(function (b) {
                                    var items = leagueInfo.items;
                                    if (!items)
                                        return undefined;
                                    var countPerPosition = items[b];
                                    if (!countPerPosition)
                                        return undefined;
                                    var count = countPerPosition[i];
                                    if (!count)
                                        return undefined;
                                    return {
                                        image: _this.assetsJSON.boosters[b].image,
                                        count: count,
                                        isActive: false
                                    };
                                }).filter(Boolean);
                                var isViewer = u.id === session.viewer.id;
                                var prize = { gifts: gifts, gold: gold, frame: frame, stone: stone, tokens: tokens, boosters: boosters };
                                return {
                                    id: u.id,
                                    name: _this.escape(u.name),
                                    photoUrl: u.photo_url,
                                    stars: u.score,
                                    isViewer: isViewer,
                                    pos: i + 1,
                                    gifts: gifts,
                                    gold: gold,
                                    ticket: (_a = leagueInfo.tickets) === null || _a === void 0 ? void 0 : _a[i],
                                    oninfo: gifts.length > 0 || gold || tokens || frame || stone
                                        ? function () { return _this.showLeagueRewardInfo(isViewer && isFinished, prize, leagueInfo.league, i + 1); }
                                        : undefined
                                };
                            });
                            var leagueList = {
                                up: users.slice(0, leagueInfo.move_up),
                                stay: users.slice(leagueInfo.move_up, leagueInfo.users_max - leagueInfo.move_down),
                                down: users.slice(leagueInfo.users_max - leagueInfo.move_down)
                            };
                            var limit = (function () {
                                if (isFinished)
                                    return undefined;
                                if (!leagueInfo.limit)
                                    return undefined;
                                return leagueInfo.limitNotify ? 'limited_with_notify' : 'limited';
                            })();
                            dlg.setUsersAndLimit(leagueList, limit);
                            var boosters = isFinished ? [] : json_1.BOOSTERS.map(function (b) {
                                var _a;
                                var booster = _this.assetsJSON.boosters[b];
                                if (booster.category !== 'league')
                                    return undefined;
                                var timer = session.viewer.viewer.timers[b];
                                var cooldown;
                                if (timer && timer.leftTimeSec > 0) {
                                    cooldown = "" + utils.secondsToMMSS(timer.leftTimeSec);
                                    if (dlgTimers[b] === undefined)
                                        dlgTimers[b] = window.setInterval(function () { return update(); }, 1000);
                                }
                                else {
                                    clearInterval(dlgTimers[b]);
                                    dlgTimers[b] = undefined;
                                }
                                return {
                                    image: booster.image,
                                    count: (_a = session.viewer.viewer.items[b]) !== null && _a !== void 0 ? _a : 0,
                                    isActive: Boolean(cooldown),
                                    cooldown: cooldown,
                                    onaction: function () { return _this.showBooster(session, b); }
                                };
                            }).filter(Boolean);
                            dlg.setBoosters(boosters);
                        };
                        update();
                        dlg.scope.addSignal(session.onLeagueUpdate, update);
                        dlg.scope.addSignal(session.viewer.isChanged, update);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var toast;
                                dlg.onopen = function () {
                                    toast = _this.showTimerWarning(function () {
                                        if (leagueInfo.state !== 'running' || !leagueInfo.finishTs)
                                            return undefined;
                                        var leftTimeSec = Math.round(leagueInfo.finishTs.leftTimeSec);
                                        return leftTimeSec <= 0
                                            ? trans.translate('dlg:league:processing')
                                            : trans.translate('dlg:top:timer:results_in') + ": " + utils.secondsToShortText(leftTimeSec, trans);
                                    });
                                };
                                dlg.onclose = function () {
                                    toast === null || toast === void 0 ? void 0 : toast.close();
                                    _this.leagueDlgBoostersActive = dlg.boostersActive();
                                    for (var _i = 0, _a = Object.keys(dlgTimers); _i < _a.length; _i++) {
                                        var timer = _a[_i];
                                        clearInterval(dlgTimers[timer]);
                                    }
                                    resolve();
                                };
                                dlg.open();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showLeagueWelcome = function (session) {
        var _this = this;
        if (!session.leagueInfo)
            return;
        var trans = this.trans;
        var dlg = this.factory.createLeagueMoveDialog({
            title: trans.translate("dlg:league:" + session.leagueInfo.league),
            description: trans.translate('dlg:league:welcome:desc'),
            leagueEvent: {
                type: 'welcome',
                cupImage: this.assetsJSON.leagues[session.leagueInfo.league].image,
            },
            btnTitle: trans.translate('dlg:harem:btn'),
            hasClose: true,
            onaction: function () { return dlg.close(); },
            onhelp: function () { return _this.showLeagueHelp(); }
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeagueStart = function (session) {
        var _this = this;
        if (!session.leagueInfo)
            return;
        var trans = this.trans;
        var dlg = this.factory.createLeagueMoveDialog({
            title: trans.translate("dlg:league:" + session.leagueInfo.league),
            description: trans.translate('dlg:league_start:desc'),
            leagueEvent: {
                type: 'start',
                cupImage: this.assetsJSON.leagues[session.leagueInfo.league].image,
            },
            btnTitle: trans.translate('dlg:league_start:btn'),
            onaction: function () {
                dlg.close();
                _this.showLeague(session);
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showLeagueFinish = function (session) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var leagueInfo, league, position, giftIds, gifts, gold, tokens, ticket, frame, stone, boosters, pt, result, dumpClient, dumpResult, message;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!session.leagueInfo)
                            return [2 /*return*/];
                        leagueInfo = session.leagueInfo;
                        league = this.assetsJSON.leagues[leagueInfo.league];
                        return [4 /*yield*/, session.updateLeagueInfo()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.showLeague(session)];
                    case 2:
                        _c.sent();
                        position = leagueInfo.users.map(function (u) { return u.id; }).indexOf(session.viewer.id);
                        giftIds = position < leagueInfo.move_up ? leagueInfo.gifts.concat() : [];
                        gifts = giftIds.map(function (g) { return _this.assetsJSON.gifts[g].storeImage; });
                        gold = leagueInfo.gold[position] || 0;
                        tokens = leagueInfo.tokens[position] || 0;
                        ticket = (_a = leagueInfo.tickets) === null || _a === void 0 ? void 0 : _a[position];
                        frame = position < leagueInfo.move_up && league.frame
                            ? this.assetsJSON.frames[league.frame].storeImage_v2
                            : undefined;
                        stone = position < leagueInfo.move_up && league.stone
                            ? this.assetsJSON.stones[league.stone].storeImage
                            : undefined;
                        boosters = json_1.BOOSTERS.map(function (b) {
                            var count = leagueInfo.items[b][position];
                            if (!count)
                                return;
                            return {
                                image: _this.assetsJSON.boosters[b].image,
                                count: count
                            };
                        }).filter(Boolean);
                        if (!(gifts.length > 0 || gold > 0 || tokens > 0 || (boosters && boosters.length > 0) || ticket || frame || stone)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.showLeagueReward(leagueInfo.league, position + 1, { gold: gold, gifts: gifts, ticket: ticket, frame: frame, stone: stone, tokens: tokens, boosters: boosters })];
                    case 3:
                        pt = _c.sent();
                        return [4 /*yield*/, session.leagueClaimReward()];
                    case 4:
                        result = _c.sent();
                        if (gold > 0)
                            this.addViewerGold(session, gold, 0, pt);
                        if (tokens > 0)
                            this.addViewerTokens(session, tokens);
                        if (result.items)
                            session.updateItems();
                        dumpClient = gold + "," + giftIds.slice(0).sort().join(',');
                        dumpResult = result.gold + "," + result.gifts.slice(0).sort().join(',');
                        if (dumpClient !== dumpResult) {
                            message = "Claim league failed: " + dumpResult + " " + dumpClient;
                            console.error('dumpLeagues', message);
                            (_b = window.Sentry) === null || _b === void 0 ? void 0 : _b.captureMessage(message);
                        }
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, session.leagueClaimReward()];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        // run in parallel
                        session.updateLeagueInfo();
                        return [4 /*yield*/, this.showLeagueResult(session, leagueInfo)];
                    case 8:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showLeagueReward = function (league, position, prize) {
        var _this = this;
        return new Promise(function (resolve) {
            var trans = _this.trans;
            var dlg = _this.factory.createRewardDialog({
                closeTitle: trans.translate("dlg:league:" + league),
                openTitle: trans.translate('dlg:league:desc:prize', position),
                description: trans.translate('dlg:league_reward:desc'),
                position: position < 4 ? position : 'regular',
                prize: prize,
                openLabel: trans.translate('dlg:league_reward:btn_open'),
                confirmAction: {
                    title: trans.translate('dlg:league_reward:btn_claim'),
                    onclick: function (pt) {
                        dlg.close();
                        resolve(pt);
                    }
                }
            });
            dlg.open();
        });
    };
    SessionFactory.prototype.showLeagueResult = function (session, leagueInfo) {
        var _this = this;
        var trans = this.trans;
        var position = leagueInfo.users.map(function (u) { return u.id; }).indexOf(session.viewer.id);
        if (position < 0)
            throw new Error('showLeagueResult with no viewer in league');
        return new Promise(function (resolve) {
            var type, description = '', nextLevel = leagueInfo.league, title = trans.translate('dlg:league_result:title'), hasClose = true;
            if (position < leagueInfo.move_up) {
                type = 'up';
                title = trans.translate('dlg:league_result:title_win');
                description = trans.translate('dlg:league_result:desc_up');
                nextLevel = leagueInfo.league + 1;
                hasClose = false;
            }
            else if (position < leagueInfo.users_max - leagueInfo.move_down) {
                type = 'stay';
                description = leagueInfo.league === leagueInfo.max_league
                    ? trans.translate('dlg:league_result:desc_stay_final', session.viewer.base.male)
                    : trans.translate('dlg:league_result:desc_stay');
            }
            else {
                type = 'down';
                description = trans.translate('dlg:league_result:desc_down');
                nextLevel = leagueInfo.league - 1;
            }
            var dlg = _this.factory.createLeagueMoveDialog({
                title: title,
                description: description,
                checkboxLabel: type === 'up' && _this.social.shareAchievement
                    ? trans.translate('dlg:scheduled:share')
                    : undefined,
                leagueEvent: {
                    type: type,
                    nextCupImage: _this.assetsJSON.leagues[nextLevel].image,
                    prevCupImage: _this.assetsJSON.leagues[leagueInfo.league].image
                },
                hasClose: hasClose,
                btnTitle: trans.translate('dlg:league_result:btn'),
                onaction: function (isPost) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var data;
                    var _a;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(isPost && this.social.shareAchievement)) return [3 /*break*/, 2];
                                data = this.assetsJSON.leagues[nextLevel];
                                return [4 /*yield*/, this.social.shareAchievement({
                                        title: trans.translate('dlg:league:share:title'),
                                        body: trans.translate('dlg:league:share:desc', (_a = session.viewer.base) === null || _a === void 0 ? void 0 : _a.male),
                                        media: data.media,
                                        vkMedia: data.vkMedia
                                    })];
                            case 1:
                                _b.sent();
                                _b.label = 2;
                            case 2:
                                dlg.close();
                                resolve();
                                return [2 /*return*/];
                        }
                    });
                }); }
            });
            dlg.open();
        });
    };
    SessionFactory.prototype.showInfoInbox = function (session, info) {
        var dlg = this.factory.createInfoDialog({
            title: info.title,
            context: info.body,
            confirmAction: {
                title: this.trans.translate('warning:self_gift:btn'),
                onclick: function (pt) {
                    dlg.close();
                    session.inboxDelete(info);
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showProfileSettings = function (session) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var dlg = _this.factory.createProfileSettingsDialog({
                            title: 'Настройки профиля',
                            gender: 'Пол',
                            man: 'муж.',
                            woman: 'жен.',
                            male: session.viewer.base ? session.viewer.base.male : true,
                            age: 'Возраст',
                            btnTitle: 'Продолжить',
                            onsave: function (male, age) {
                                session.updateProfile(male, age);
                                dlg.close();
                                resolve();
                            }
                        });
                        dlg.open();
                    })];
            });
        });
    };
    SessionFactory.prototype.showPhotoSetup = function () {
        var dlg = this.factory.createInfoDialog({
            title: 'Фото',
            context: 'С настоящей фотографией играть интереснее!\nЗагрузи фото в Яндекс.Паспорте и оно появится в игре.',
            imageId: 'ya-photo',
            confirmAction: {
                title: 'Загрузить',
                onclick: function (pt) {
                    window.open('https://passport.yandex.ru', '_blank');
                    dlg.close();
                }
            },
            cancelAction: {
                title: 'Позже',
                onclick: function (pt) { return dlg.close(); }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showTickets = function (session) {
        var _this = this;
        if (typeof session.tickets !== 'number' || !session.ticketsTs || session.ticketsTs.leftTimeSec <= 0)
            return;
        var platform;
        var phones;
        switch (this.social.id) {
            case 'fb':
            case 'fbig':
            case 'local':
            case 'ma':
            case 'ya':
                return;
            case 'mm':
                platform = 'ММ';
                phones = undefined;
                break;
            case 'ok':
                platform = 'ОК';
                phones = 30;
                break;
            case 'vk':
                platform = 'ВК';
                phones = 10;
                break;
            default:
                (function (x) { })(this.social.id);
                return;
        }
        var dlg = this.factory.createTicketsDialog({
            tickets: session.tickets,
            platform: platform,
            phones: phones
        });
        var toast;
        dlg.onopen = function () {
            toast = _this.showTimerWarning(function () {
                if (!session.ticketsTs || session.ticketsTs.leftTimeSec <= 0) {
                    dlg.close();
                    return undefined;
                }
                var leftTimeSec = Math.round(session.ticketsTs.leftTimeSec);
                return "\u041E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u0435 \u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448\u0430 \u0447\u0435\u0440\u0435\u0437: " + utils.secondsToShortText(leftTimeSec, _this.trans);
            });
        };
        dlg.onclose = function () { return toast === null || toast === void 0 ? void 0 : toast.close(); };
        dlg.open();
    };
    SessionFactory.prototype.showRewardedVideoWidget = function (session, gold) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rv;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ((_b = (_a = this.social).prepareRewardedVideo) === null || _b === void 0 ? void 0 : _b.call(_a))];
                    case 1:
                        rv = _d.sent();
                        if (!rv)
                            return [2 /*return*/];
                        (_c = this.chatPresenter) === null || _c === void 0 ? void 0 : _c.rewardedVideo(gold);
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionFactory.prototype.showBottlePass = function (session) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trans, passInfoTimer, levelTimer, onhelp, dlg, updatePassInfo, updateBonus, prize, updateLevels, updateLevelTimer;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                trans = this.trans;
                if (!session.passInfo)
                    return [2 /*return*/];
                onhelp = function () {
                    var helpDlg = _this.factory.createInfoDialog({
                        title: trans.translate('dlg:bottle_pass_info:title'),
                        context: trans.translate('dlg:bottle_pass_info:desc1') + "\n\n" + trans.translate('dlg:bottle_pass_info:desc2'),
                        hasClose: true,
                        confirmAction: {
                            title: trans.translate('dlg:navigate_vip:btn'),
                            onclick: function (pt) { return helpDlg.close(); }
                        }
                    });
                    helpDlg.open();
                };
                dlg = this.factory.createBottlePassDialog({
                    title: trans.translate('dlg:bottle_pass:title'),
                    premiumPrizeTitle: trans.translate('dlg:bottle_pass:premium_pack'),
                    freePrizeTitle: trans.translate('dlg:bottle_pass:free'),
                    levelTitle: trans.translate('dlg:bottle_pass:level'),
                    onhelp: onhelp
                });
                updatePassInfo = function () {
                    if (!session.passInfo) {
                        dlg.close();
                        return;
                    }
                    var currentScore, neededScore;
                    if (session.passInfo.level === session.passInfo.levels.length - 1) {
                        if (session.passInfo.pass_premium) {
                            currentScore = (session.passInfo.score - session.passInfo.levels[session.passInfo.level].score) %
                                session.passInfo.chest.overscore2gold;
                            neededScore = session.passInfo.chest.overscore2gold;
                        }
                        else {
                            currentScore = session.passInfo.levels[session.passInfo.levels.length - 1].score -
                                session.passInfo.levels[session.passInfo.levels.length - 2].score;
                            neededScore = currentScore;
                        }
                    }
                    else {
                        currentScore = session.passInfo.score - session.passInfo.levels[session.passInfo.level].score;
                        neededScore = session.passInfo.levels[session.passInfo.level + 1].score -
                            session.passInfo.levels[session.passInfo.level].score;
                    }
                    var params = {
                        premiumTitle: trans.translate('dlg:bottle_pass:premium_pass'),
                        isPremium: session.passInfo.pass_premium,
                        stateTitle: trans.translate('dlg:bottle_pass:finished'),
                        currentScore: currentScore,
                        neededScore: neededScore,
                        target: session.passInfo.level === session.passInfo.levels.length - 1 && session.passInfo.pass_premium
                            ? 1
                            : Math.min(session.passInfo.level + 2, session.passInfo.levels.length),
                        onpremium: function () { return _this.showBottlePassPremium(session); }
                    };
                    if (session.passInfo.finishTs && session.passInfo.finishTs.leftTimeSec > 0) {
                        dlg.setPassInfo(tslib_1.__assign(tslib_1.__assign({}, params), { levelType: session.passInfo.level === session.passInfo.levels.length - 1 && session.passInfo.pass_premium
                                ? (session.passInfo.chest.gold === session.passInfo.chest.gold_max ? undefined : 'heart')
                                : 'level', stateTitle: trans.translate('dlg:bottle_pass:timer'), timer: utils.secondsToLongText(session.passInfo.finishTs.leftTimeSec, trans, 2) }));
                        if (!passInfoTimer)
                            passInfoTimer = window.setInterval(updatePassInfo, 1000);
                    }
                    else {
                        clearInterval(passInfoTimer);
                        passInfoTimer = undefined;
                        dlg.setPassInfo(params);
                    }
                };
                dlg.scope.addSignal(session.onPassUpdate, updatePassInfo).call();
                updateBonus = function () {
                    if (!session.passInfo) {
                        dlg.close();
                        return;
                    }
                    var btnTitle = function () {
                        if (!session.passInfo)
                            return '';
                        if (!session.passInfo.pass_premium)
                            return trans.translate('dlg:bottle_pass:pass_offer');
                        if (session.passInfo.chest.claimed)
                            return trans.translate('dlg:bottle_pass:bonus_chest:collected');
                        if (session.passInfo.state === 'finished')
                            return trans.translate('dlg:bottle_pass:bonus_chest:open');
                        return trans.translate('dlg:bottle_pass:bonus_chest:counter');
                    };
                    dlg.setBonus({
                        btnTitle: btnTitle(),
                        premium: session.passInfo.pass_premium,
                        chestTitle: trans.translate('dlg:bottle_pass:bonus_chest:title'),
                        chestDesc: trans.translate('dlg:bottle_pass:bonus_chest:desc', '<level>'),
                        level: session.passInfo.levels.length,
                        stars: session.passInfo.chest.overscore2gold,
                        gold: 1,
                        maxScoreTitle: trans.translate('dlg:bottle_pass:bonus_chest:maximum'),
                        maxScore: session.passInfo.chest.gold_max,
                        score: session.passInfo.chest.gold,
                        claimed: session.passInfo.chest.claimed,
                        finished: !session.isPassRunning,
                        onchest: function () { return _this.showBottlePassPremium(session); },
                        onclaimchest: function (pt) {
                            if (!session.passInfo)
                                return;
                            if (!session.passInfo.pass_premium) {
                                _this.showBottlePassPremium(session);
                                return;
                            }
                            if (session.isPassRunning) {
                                _this.showWarning(trans.translate('dlg:bottle_pass:bonus_chest:finish_block'));
                                return;
                            }
                            if (session.passInfo.chest.gold > 0 && !session.passInfo.chest.claimed) {
                                session.claimPassChestReward();
                                _this.addViewerGold(session, session.passInfo.chest.gold, 0, pt);
                            }
                        }
                    });
                };
                dlg.scope.addSignal(session.onPassUpdate, updateBonus).call();
                prize = function (r, level, active, premium) {
                    var _a;
                    var tryShowChest = function () {
                        if (!prize.boosters || prize.boosters.length < 2)
                            return;
                        var dlg = _this.factory.createRewardInfoDialog({
                            title: _this.trans.translate('dlg:bottle_pass_reward_info:title'),
                            position: prize.boosters[0].category,
                            prize: { boosters: prize.boosters }
                        });
                        dlg.open();
                    };
                    var frameId, stoneId;
                    var prize = {
                        claimed: (_a = r.claimed) !== null && _a !== void 0 ? _a : false,
                        gold: r.gold,
                        tokens: r.tokens,
                        boosters: [],
                        onprize: function (pt) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var reward;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (r.claimed) {
                                            this.showWarning(trans.translate('dlg:bottle_pass:reward:collected'));
                                            return [2 /*return*/];
                                        }
                                        if (premium === false) {
                                            tryShowChest();
                                            this.showWarning(trans.translate('dlg:bottle_pass:reward:pass_block'));
                                            return [2 /*return*/];
                                        }
                                        if (!active) {
                                            tryShowChest();
                                            this.showWarning(trans.translate('dlg:bottle_pass:reward:level_block'));
                                            return [2 /*return*/];
                                        }
                                        if (prize.boosters && prize.boosters.length > 1) {
                                            this.showBottlePassReward(prize.boosters[0].category, { boosters: prize.boosters }, function () { return session.claimPassLevelReward(level, premium !== null && premium !== void 0 ? premium : false); });
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, session.claimPassLevelReward(level, premium !== null && premium !== void 0 ? premium : false)];
                                    case 1:
                                        reward = (_a.sent()).reward;
                                        if (reward.gold)
                                            this.addViewerGold(session, reward.gold, 0, pt);
                                        if (reward.tokens)
                                            this.addViewerTokens(session, reward.tokens);
                                        if (prize.decor)
                                            this.showDecorSelection(session, { frame: frameId, stone: stoneId });
                                        return [2 /*return*/];
                                }
                            });
                        }); }
                    };
                    if (r.items) {
                        for (var item in r.items) {
                            var frame = _this.assetsJSON.frames[item];
                            if (frame) {
                                frameId = item;
                                stoneId = item;
                                prize.decor = {
                                    frame: frame.storeImage_v2,
                                    stone: _this.assetsJSON.stones[item].storeImage
                                };
                                continue;
                            }
                        }
                        for (var _i = 0, BOOSTERS_2 = json_1.BOOSTERS; _i < BOOSTERS_2.length; _i++) {
                            var b = BOOSTERS_2[_i];
                            var count = r.items[b];
                            if (!count)
                                continue;
                            var booster = _this.assetsJSON.boosters[b];
                            prize.boosters.push({
                                category: booster.category,
                                image: booster.image,
                                count: count,
                                icon: b
                            });
                        }
                    }
                    return prize;
                };
                updateLevels = function () {
                    if (!session.passInfo) {
                        dlg.close();
                        return;
                    }
                    var levels = session.passInfo.levels.map(function (l) {
                        var active = l.level <= session.passInfo.level;
                        return {
                            level: l.level + 1,
                            premium: prize(l.paid, l.level, active, session.passInfo.pass_premium),
                            free: prize(l.free, l.level, active),
                            active: active
                        };
                    }).sort(function (a, b) { return b.level - a.level; });
                    dlg.setLevels(levels);
                };
                dlg.scope.addSignal(session.onPassUpdate, updateLevels).call();
                updateLevelTimer = function () {
                    if (!session.passInfo) {
                        dlg.close();
                        return;
                    }
                    var lvl = session.passInfo.levels.filter(function (f) { return f.startTs.leftTimeSec > 0; })[0];
                    if (lvl) {
                        dlg.setLevelTimer({
                            title: trans.translate('dlg:bottle_pass:level_opens_in', lvl.level + 1),
                            timer: utils.secondsToHHMMSS(lvl.startTs.leftTimeSec),
                            level: lvl.level
                        });
                        if (!levelTimer)
                            levelTimer = window.setInterval(updateLevelTimer, 1000);
                    }
                    else {
                        clearInterval(levelTimer);
                        levelTimer = undefined;
                        dlg.setLevelTimer();
                    }
                };
                dlg.scope.addSignal(session.onPassUpdate, updateLevelTimer).call();
                dlg.onopen = function () {
                    dlg.scrollTo();
                    if (session.showPassManual) {
                        session.showPassManual = false;
                        onhelp();
                    }
                };
                dlg.onclose = function () { return clearInterval(passInfoTimer); };
                dlg.open();
                return [2 /*return*/];
            });
        });
    };
    SessionFactory.prototype.showBottlePassPremium = function (session) {
        var _this = this;
        if (!session.passInfo)
            return;
        var prize = {
            boosters: json_1.BOOSTERS.map(function (b) {
                return {
                    image: _this.assetsJSON.boosters[b].image,
                    count: 0
                };
            })
        };
        for (var _i = 0, _a = session.passInfo.levels; _i < _a.length; _i++) {
            var lvl = _a[_i];
            if (lvl.paid.gold)
                prize.gold = prize.gold ? prize.gold + lvl.paid.gold : lvl.paid.gold;
            if (lvl.paid.tokens)
                prize.token = prize.token ? prize.token + lvl.paid.tokens : lvl.paid.tokens;
            if (lvl.paid.items) {
                var _loop_7 = function (item) {
                    var frame = this_1.assetsJSON.frames[item];
                    if (frame) {
                        prize.frame = frame.storeImage_v2;
                        prize.stone = this_1.assetsJSON.stones[item].storeImage;
                        return "continue";
                    }
                    var id = item;
                    var booster = this_1.assetsJSON.boosters[id];
                    if (!booster)
                        return "continue";
                    var pBooster = prize.boosters.filter(function (f) { return f.image === booster.image; })[0];
                    pBooster.count = pBooster.count + lvl.paid.items[id];
                };
                var this_1 = this;
                for (var item in lvl.paid.items) {
                    _loop_7(item);
                }
            }
        }
        prize.boosters = prize.boosters.filter(function (f) { return f.count !== 0; });
        var dlg = this.factory.createBottlePassPremiumDialog({
            title: this.trans.translate('dlg:bottle_pass:premium_pass'),
            description: this.trans.translate('dlg:premium_pass:desc'),
            features: [
                {
                    title: this.trans.translate('dlg:premium_pass:feature:name'),
                    icon: 'name'
                },
                {
                    title: this.trans.translate('dlg:premium_pass:feature:daily'),
                    icon: 'daily'
                },
                {
                    title: this.trans.translate('dlg:premium_pass:feature:decor'),
                    icon: 'decor'
                },
                {
                    title: this.trans.translate('dlg:premium_pass:feature:chest'),
                    icon: 'chest',
                    value: session.passInfo.chest.gold_max
                }
            ],
            prizeTitle: this.trans.translate('dlg:premium_pass:prize:title'),
            prize: prize
        });
        var updateAction = function () {
            if (!session.passInfo) {
                dlg.close();
                return;
            }
            if (session.passInfo.finishTs && session.passInfo.finishTs.leftTime < 1) {
                passTimer.remove();
                dlg.setAction({
                    type: 'finished',
                    label: _this.trans.translate('dlg:premium_pass:finished'),
                });
                return;
            }
            if (session.passInfo.pass_premium) {
                dlg.setAction({
                    type: 'purchased',
                    label: _this.trans.translate('dlg:premium_pass:purchased'),
                });
            }
            else {
                var option_1 = _this.social.premiumOption(_this.trans);
                if (option_1) {
                    dlg.setAction({
                        type: 'buy',
                        label: _this.trans.translate('dlg:premium_pass:buy'),
                        button: {
                            title: option_1.price,
                            onclick: function () { return option_1.purchase(); }
                        }
                    });
                }
                else {
                    dlg.setAction({
                        type: 'disabled',
                        label: _this.trans.translate('dlg:premium_pass:buy'),
                        button: {
                            title: _this.trans.translate('dlg:music:unavailable'),
                            onclick: function () { return _this.showWarning(_this.trans.translate('dlg:premium_pass:disabled')); }
                        }
                    });
                }
            }
        };
        var passTimer = dlg.scope.addInterval(updateAction, 1000);
        dlg.scope.addSignal(session.onPassUpdate, updateAction);
        updateAction();
        dlg.open();
    };
    SessionFactory.prototype.showBottlePassReward = function (position, prize, cb) {
        var trans = this.trans;
        var dlg = this.factory.createRewardDialog({
            closeTitle: trans.translate('dlg:league_result:title_win'),
            openTitle: trans.translate('dlg:bottle_pass_reward:desc:rewards').replace(':', ''),
            description: trans.translate('dlg:bottle_pass_reward:desc'),
            position: position,
            prize: prize,
            openLabel: trans.translate('dlg:league_reward:btn_open'),
            confirmAction: {
                title: trans.translate('dlg:league_reward:btn_claim'),
                onclick: function (pt) {
                    dlg.close();
                    cb();
                }
            }
        });
        dlg.open();
    };
    SessionFactory.prototype.showBottlePassRewardsCollected = function (session, reward) {
        var _this = this;
        var params = {
            openTitle: this.trans.translate('dlg:bottle_pass_reward_collect:title'),
            description: this.trans.translate('dlg:bottle_pass_reward_collect:desc'),
            opened: true,
            hasClose: true,
            prize: {
                gold: reward.gold,
                tokens: reward.tokens,
                boosters: []
            },
            confirmAction: {
                title: this.trans.translate('dlg:navigate_vip:btn'),
                onclick: function () { return dlg.close(); }
            }
        };
        if (reward.items) {
            for (var item in reward.items) {
                var frame = this.assetsJSON.frames[item];
                if (frame) {
                    params.prize.frame = frame.storeImage_v2;
                    params.prize.stone = this.assetsJSON.stones[item].storeImage;
                    continue;
                }
            }
            for (var _i = 0, BOOSTERS_3 = json_1.BOOSTERS; _i < BOOSTERS_3.length; _i++) {
                var b = BOOSTERS_3[_i];
                var count = reward.items[b];
                if (!count)
                    continue;
                var booster = this.assetsJSON.boosters[b];
                params.prize.boosters.push({
                    image: booster.image,
                    count: count
                });
            }
        }
        var dlg = this.factory.createRewardDialog(params);
        dlg.onclose = function () {
            if (reward.gold)
                _this.addViewerGold(session, reward.gold, 0);
            if (reward.tokens)
                _this.addViewerTokens(session, reward.tokens);
            if (reward.items)
                session.updateItems();
        };
        dlg.open();
    };
    return SessionFactory;
}());
function UserBanIn_getContext(obj, trans) {
    var reason = obj.banned_reason
        ? trans.translate("dlg:banned:reason:" + obj.banned_reason) || obj.banned_reason
        : trans.translate('dlg:banned:reason:undefined');
    var diff = (function (ms) {
        var MINUTE_MS = 60000;
        var HOUR_MS = 3600000;
        var DAY_MS = 86400000;
        if (ms < HOUR_MS)
            return trans.translate("dlg:banned:minutes", Math.ceil(ms / MINUTE_MS));
        if (ms < DAY_MS)
            return trans.translate("dlg:banned:hours", Math.ceil(ms / HOUR_MS));
        return trans.translate("dlg:banned:days", Math.ceil(ms / DAY_MS));
    })(obj.banned_left);
    return trans.translate('dlg:banned:desc', diff, reason);
}
function showSessionError(factory, trans, social, err, // ANY: err
data, cb) {
    if (err && err['message'] === 'auto_reconnect') {
        cb('reconnect');
        return;
    }
    else if (err && err['message'] === 'toggle_test_server') {
        cb('toggle_test_server');
        return;
    }
    var params = (function () {
        var reconnect = function () {
            info.close();
            cb('reconnect');
        };
        switch (err && err['message']) {
            case 'age_restriction': return {
                title: trans.translate('dlg:age_restriction:title'),
                context: trans.translate('dlg:age_restriction:desc2'),
                imageId: 'age-restriction'
            };
            case 'inactivity_shutdown': return {
                title: trans.translate('html:dlg:inactivity:title'),
                context: trans.translate('html:dlg:inactivity:desc'),
                imageId: 'inactivity',
                confirmAction: {
                    title: trans.translate('dlg:inactivity:btn'),
                    onclick: reconnect
                }
            };
            case 'other_client_shutdown': return {
                title: trans.translate('dlg:other_client_shutdown:title'),
                context: trans.translate('dlg:other_client_shutdown:desc'),
                imageId: 'other-connection',
                confirmAction: {
                    title: trans.translate('dlg:inactivity:btn'),
                    onclick: reconnect
                }
            };
            case 'session_expired': return {
                title: trans.translate('dlg:session_expired:title'),
                context: trans.translate('dlg:session_expired:text2'),
                imageId: 'session-expired'
            };
            case 'user_ban': return {
                title: trans.translate('dlg:banned:title'),
                context: UserBanIn_getContext(data, trans),
                imageId: 'ban-male'
            };
            default: return {
                title: trans.translate('html:dlg:server_error:title'),
                context: trans.translate('html:dlg:server_error:desc'),
                imageId: 'disconnect',
                confirmAction: {
                    title: trans.translate('html:dlg:server_error:btn'),
                    onclick: reconnect
                }
            };
        }
    })();
    if (!params.cancelAction && social.logout) {
        params.cancelAction = {
            title: trans.translate('android:settings:logout'),
            onclick: function () {
                info.close();
                cb('logout');
            }
        };
    }
    var info = factory.createInfoDialog(params);
    info.open();
}
function main(env, social, config) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var locale = new model_1.Locale(social.locale || utils.getBrowserLocale());
        var coordinator = new MusicCoordinator_1.MusicCoordinator(env.preferences);
        var trans = env.translators[locale.locale];
        trans.nameEnumerator = function (name) { return [social.id + ":" + name, name]; };
        var factory = env.root.createFactory();
        factory.imageLoader = env.imageLoader;
        factory.photoLoader = env.photoLoader;
        factory.liftChatInputOnFocus = config.liftChatInputOnFocus;
        factory.softInputFixedHeight = config.softInputFixedHeight;
        factory.adaptivePlayer = config.adaptivePlayer;
        var socketId = config.useTestServer ? 'test' : social.id;
        var socketFactory = env.socketFactories[socketId];
        var socket = socketFactory();
        socket.onrecvcomplete = function () { return env.root.update(); };
        var s = new session_1.Session(socket, env.root.timer);
        var sessionFactory = new SessionFactory(s, factory, trans, env, social, config, locale, coordinator);
        s.allowNativeAppPromo = config.allowNativeAppPromo;
        s.allowVipPromo = Boolean(social.vipOptions(trans));
        s.reconnectOnPacketDrop = config.reconnectOnPacketDrop;
        s.bottleFactory = new model_1.BottleFactory(env.assetsJSON.bottles);
        s.giftFactory = new model_1.GiftFactory(env.assetsJSON.gifts);
        s.gestureFactory = new model_1.GestureFactory(env.assetsJSON.gestures);
        s.boosterFactory = new model_1.BoosterFactory(env.assetsJSON.boosters);
        s.dialogs = sessionFactory;
        s.blockedPhotoUrl = DefaultPhotos_1.ignorePhoto;
        s.onlogin.push(function () {
            var _a;
            (_a = window.Sentry) === null || _a === void 0 ? void 0 : _a.configureScope(function (scope) {
                scope.setUser({ id: s.viewer.id });
                scope.setTag('social', social.id + "_" + social.trackId);
                scope.setTag('social_ua', social.userAgent || 'undefined');
            });
            s.scope.addSignal(env.root.onUserDidAction, utils.throttle(function () {
                s.reportActivity();
            }, 1000 * 10));
            s.scope.addSignal(env.root.onVisibilityChanged, function (isForeground) {
                s.view(isForeground);
                if (social.muteInBackground) {
                    if (!isForeground) {
                        coordinator.enterMute('bg');
                        env.root.sfxManager.enabled = false;
                    }
                    else {
                        coordinator.leaveMute('bg');
                        env.root.sfxManager.enabled = env.preferences.isSfxEnabled;
                    }
                }
            });
            social.setSession(s, factory, trans);
            Promise.all([
                social.queryCaps(),
                utils.queryCaps()
            ]).then(function (result) {
                var caps = utils.array.flatten(result).join(',');
                s.trackEvent('caps', social.trackId, caps);
            });
        });
        s.ontutorial = function (tutorial) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var params, tutorialPresenter, _i, _a, cb;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(social instanceof YASocial_1.YASocial)) return [3 /*break*/, 2];
                        return [4 /*yield*/, sessionFactory.showProfileSettings(s)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        params = {
                            bottle: s.abTest.bottle
                        };
                        tutorialPresenter = new TutorialPresenter_1.TutorialPresenter(s.viewer, s.bottleFactory, s.giftFactory, factory, trans, env, social, locale, tutorial.users, params);
                        tutorialPresenter.onevent = function (e) { return s.clientEvent(e); };
                        tutorial.ondestroy = function () { return factory.showLoadingView(locale); };
                        return [4 /*yield*/, tutorialPresenter.run()];
                    case 3:
                        _b.sent();
                        if (!(social instanceof VKSocial_1.VKSocial)) return [3 /*break*/, 5];
                        return [4 /*yield*/, social.ensureEssentialPermissions()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        s.gotoRandom();
                        s.scheduleTutorialBonus(function (bonus) { return sessionFactory.showReceivedGold(s, bonus, 'tutorial:dlg:gold2'); });
                        for (_i = 0, _a = s.postTutorial; _i < _a.length; _i++) {
                            cb = _a[_i];
                            cb();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        s.onentergame = function (game, enteredAfterWait) {
            sessionFactory.enterGame(s, game, enteredAfterWait);
            if (social instanceof YASocial_1.YASocial && (!s.viewer.photoUrl || s.viewer.photoUrl.indexOf('butilochka.cdnvideo.ru') !== -1))
                sessionFactory.showPhotoSetup();
        };
        s.onenterloading = function (loading) {
            sessionFactory.enterLoading(s, loading);
        };
        s.onerror = function (err, data) {
            var _a;
            trans.nameEnumerator = undefined;
            s.onerror = undefined;
            s.destroy();
            // 20210909: track errors after FB users reauth on login
            if (social instanceof FBSocial_1.FBSocial && social.usedReauthorizeLogin) {
                if (!s.isLoginSuccessful) {
                    (_a = window.Sentry) === null || _a === void 0 ? void 0 : _a.captureException(new Error("Login failed"));
                }
            }
            env.root.dialogManager.closeAll();
            showSessionError(factory, trans, social, err, data, resolve);
        };
        s.onlogout = function () {
            trans.nameEnumerator = undefined;
            s.onerror = undefined;
            s.destroy();
            resolve('logout');
        };
        s.ondestroy = function () {
            factory.destroy();
            social.setSession(undefined, undefined);
        };
        if (social instanceof FBIGSocial_1.FBIGSocial) {
            s.ontopkiss = utils.throttle(function () {
                s.queryUserProfile(s.viewer).then(function (profile) {
                    social.updateTop(profile.total_kisses, 'Most kissed');
                });
            }, 1000 * 10);
            s.ontopdj = utils.throttle(function () {
                s.queryUserProfile(s.viewer).then(function (profile) {
                    social.updateTop(profile.dj_score, 'Best DJs');
                });
            }, 1000 * 10);
            s.ontopexpensive = utils.throttle(function () {
                s.queryUserProfile(s.viewer).then(function (profile) {
                    social.updateTop(profile.price, 'Most expensive');
                });
            }, 1000 * 10);
            s.ontopimportant = utils.throttle(function () {
                s.queryUserProfile(s.viewer).then(function (profile) {
                    social.updateTop(profile.harem_price, 'Most important');
                });
            }, 1000 * 10);
            s.postTutorial.push(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var can;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, social.canSubscribeBot()];
                        case 1:
                            can = _a.sent();
                            if (can)
                                social.subscribeBot('tutor0');
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        if (social instanceof OKSocial_1.OKSocial) {
            var desktopIcon_1 = social.desktopIcon();
            if (desktopIcon_1) {
                var suggestOKShortcut_1 = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var gold;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!desktopIcon_1.canSuggestDesktopIcon()) return [3 /*break*/, 2];
                                return [4 /*yield*/, s.checkAndroidShortcutRewardAvailable()];
                            case 1:
                                gold = _a.sent();
                                if (gold > 0) {
                                    sessionFactory.showShortcut(s, gold, function () {
                                        desktopIcon_1.suggestDesktopIcon();
                                        s.schedule(function () {
                                            sessionFactory.showInfo("Для получения награды запустите игру через созданный ярлык на домашнем экране телефона");
                                        }, 7 * 1000);
                                    });
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); };
                s.ongamelogin.push(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var gold;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!desktopIcon_1.launchedFromDesktop()) return [3 /*break*/, 2];
                                return [4 /*yield*/, s.receiveAndroidShortcutReward()];
                            case 1:
                                gold = _a.sent();
                                if (gold > 0) {
                                    sessionFactory.showReceivedGold(s, gold, 'html:dlg:gold:fb_shortcut2');
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                s.schedule(suggestOKShortcut_1, 120 * 1000);
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
            }
            if (social.prizeAvailable) {
                s.ongamelogin.push(function () {
                    s.okClaimPrize();
                });
            }
        }
        if (social instanceof VKSocial_1.VKSocial) {
            s.postTutorial.push(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var result;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, social.tryAddToFavorites()];
                        case 1:
                            result = _a.sent();
                            s.trackEvent('favourites_tutor0', social.trackId, result);
                            return [2 /*return*/];
                    }
                });
            }); });
            s.ongamelogin.push(function () {
                if (!s.viewer.viewer.isNew) {
                    social.ensureEssentialPermissions();
                }
            });
            if (social.promoHasActiveGift) {
                s.ongamelogin.push(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var gold;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, s.claimPromoBonus(15)];
                            case 1:
                                gold = _a.sent();
                                if (gold > 0) {
                                    s.schedule(function () {
                                        sessionFactory.showPromoBonusVK(s, gold);
                                    }, 1 * 1000);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
        }
        if (social instanceof VKSocial_1.VKSocial && social.mainAppUrl !== '') {
            var dlg = factory.createInfoDialog({
                hasClose: true,
                context: 'Целуй и Знакомься переехала!\nИгра в одном клике от тебя:',
                confirmAction: {
                    title: 'Играть',
                    onclick: function () { return window.open(social.mainAppUrl, '_blank'); }
                }
            });
            dlg.open();
        }
        else {
            var loginData = tslib_1.__assign({ screen: [
                    env.startScreen.width, env.startScreen.height, Math.round(1000 * env.startScreen.dpr),
                    env.maxScreen.width, env.maxScreen.height, Math.round(1000 * env.maxScreen.dpr)
                ], locale: utils.getBrowserLocale(), tz_offset: -(new Date().getTimezoneOffset()) / 60, system_id: env.systemId, user_agent: [
                    navigator.userAgent,
                    factory.caps,
                    social.userAgent || '',
                    "Bottle/" + __VERSION__
                ].filter(Boolean).join(' ') }, social.loginData);
            s.start(loginData);
        }
        if (social instanceof YASocial_1.YASocial) {
            s.postTutorial.push(function () {
                social.ymTutorialComplete();
            });
        }
    });
}
exports.main = main;
