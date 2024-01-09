"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Epub = void 0;
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
// @ts-ignore
var node_zip_1 = __importDefault(require("node-zip"));
var xml2js_1 = __importDefault(require("xml2js"));
var parseLink_1 = __importDefault(require("./parseLink"));
var parseSection_1 = __importDefault(require("./parseSection"));
var xmlParser = new xml2js_1.default.Parser();
var xmlToJs = function (xml) {
    return new Promise(function (resolve, reject) {
        xmlParser.parseString(xml, function (err, object) {
            if (err) {
                reject(err);
            }
            else {
                resolve(object);
            }
        });
    });
};
var determineRoot = function (opfPath) {
    var root = '';
    // set the opsRoot for resolving paths
    if (opfPath.match(/\//)) {
        // not at top level
        root = opfPath.replace(/\/([^\/]+)\.opf/i, '');
        if (!root.match(/\/$/)) {
            // 以 '/' 结尾，下面的 zip 路径写法会简单很多
            root += '/';
        }
        if (root.match(/^\//)) {
            root = root.replace(/^\//, '');
        }
    }
    return root;
};
var parseMetadata = function (metadata) {
    var title = lodash_1.default.get(metadata[0], ['dc:title', 0]);
    var authors = lodash_1.default.get(metadata[0], ['dc:creator']);
    if (typeof authors === 'object') {
        authors = [lodash_1.default.get(authors, ['_'])];
    }
    var publisher = lodash_1.default.get(metadata[0], ['dc:publisher', 0]);
    return {
        title: title,
        authors: authors,
        publisher: publisher,
    };
};
var Epub = /** @class */ (function () {
    function Epub(buffer) {
        this._zip = new node_zip_1.default(buffer, { binary: true, base64: false, checkCRC32: true });
    }
    Epub.prototype.resolve = function (path) {
        var _path;
        if (path[0] === '/') {
            // use absolute path, root is zip root
            _path = path.substr(1);
        }
        else {
            _path = this._root + path;
        }
        var file = this._zip.file(decodeURI(_path));
        if (file) {
            return file;
        }
        else {
            throw new Error(_path + " not found!");
        }
    };
    Epub.prototype._resolveXMLAsJsObject = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var xml;
            return __generator(this, function (_a) {
                xml = this.resolve(path).asText();
                return [2 /*return*/, xmlToJs(xml)];
            });
        });
    };
    Epub.prototype._getOpfPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var container;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._resolveXMLAsJsObject('/META-INF/container.xml')];
                    case 1:
                        container = _a.sent();
                        return [2 /*return*/, container.container.rootfiles[0].rootfile[0]['$']['full-path']];
                }
            });
        });
    };
    Epub.prototype._getManifest = function (content) {
        return lodash_1.default.get(content, ['package', 'manifest', 0, 'item'], []).map(function (item) { return item.$; });
    };
    Epub.prototype._resolveIdFromLink = function (href) {
        var tarName = parseLink_1.default(href).name;
        var tarItem = lodash_1.default.find(this._manifest, function (item) {
            var name = parseLink_1.default(item.href).name;
            return name === tarName;
        });
        return lodash_1.default.get(tarItem, 'id');
    };
    Epub.prototype._getSpine = function () {
        return lodash_1.default.get(this._content, ['package', 'spine', 0, 'itemref'], []).map(function (item) {
            return item.$.idref;
        });
    };
    Epub.prototype._genStructureForHTML = function (tocObj) {
        var _this = this;
        var tocRoot = tocObj.html.body[0].nav[0]['ol'][0].li;
        var runningIndex = 1;
        var parseHTMLNavPoints = function (navPoint) {
            var _a, _b;
            var element = navPoint.a[0] || {};
            var path = element['$'].href;
            var name = element['_'];
            var prefix = element.span;
            if (prefix) {
                name = "" + prefix.map(function (p) { return p['_']; }).join('') + name;
            }
            var sectionId = _this._resolveIdFromLink(path);
            var nodeId = parseLink_1.default(path).hash;
            var playOrder = runningIndex;
            var children = (_b = (_a = navPoint === null || navPoint === void 0 ? void 0 : navPoint.ol) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.li;
            if (children) {
                children = parseOuterHTML(children);
            }
            runningIndex++;
            return {
                name: name,
                sectionId: sectionId,
                nodeId: nodeId,
                path: path,
                playOrder: playOrder,
                children: children,
            };
        };
        var parseOuterHTML = function (collection) {
            return collection.map(function (point) {
                return parseHTMLNavPoints(point);
            });
        };
        return parseOuterHTML(tocRoot);
    };
    Epub.prototype._genStructure = function (tocObj, resolveNodeId) {
        var _this = this;
        if (resolveNodeId === void 0) { resolveNodeId = false; }
        if (tocObj.html) {
            return this._genStructureForHTML(tocObj);
        }
        var rootNavPoints = lodash_1.default.get(tocObj, ['ncx', 'navMap', '0', 'navPoint'], []);
        var parseNavPoint = function (navPoint) {
            // link to section
            var path = lodash_1.default.get(navPoint, ['content', '0', '$', 'src'], '');
            var name = lodash_1.default.get(navPoint, ['navLabel', '0', 'text', '0']);
            var playOrder = lodash_1.default.get(navPoint, ['$', 'playOrder']);
            var nodeId = parseLink_1.default(path).hash;
            var children = navPoint.navPoint;
            if (children) {
                // tslint:disable-next-line:no-use-before-declare
                children = parseNavPoints(children);
            }
            var sectionId = _this._resolveIdFromLink(path);
            return {
                name: name,
                sectionId: sectionId,
                nodeId: nodeId,
                path: path,
                playOrder: playOrder,
                children: children,
            };
        };
        var parseNavPoints = function (navPoints) {
            return navPoints.map(function (point) {
                return parseNavPoint(point);
            });
        };
        return parseNavPoints(rootNavPoints);
    };
    Epub.prototype._resolveSectionsFromSpine = function (expand) {
        var _this = this;
        if (expand === void 0) { expand = false; }
        // no chain
        return lodash_1.default.map(lodash_1.default.union(this._spine), function (id) {
            var path = lodash_1.default.find(_this._manifest, { id: id }).href;
            var html = _this.resolve(path).asText();
            return parseSection_1.default({
                id: id,
                htmlString: html,
                resourceResolver: _this.resolve.bind(_this),
                idResolver: _this._resolveIdFromLink.bind(_this),
                expand: expand,
            });
        });
    };
    Epub.prototype.parse = function (expand) {
        if (expand === void 0) { expand = false; }
        return __awaiter(this, void 0, void 0, function () {
            var opfPath, content, manifest, metadata, tocID, tocPath, toc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getOpfPath()];
                    case 1:
                        opfPath = _a.sent();
                        this._root = determineRoot(opfPath);
                        return [4 /*yield*/, this._resolveXMLAsJsObject('/' + opfPath)];
                    case 2:
                        content = _a.sent();
                        manifest = this._getManifest(content);
                        metadata = lodash_1.default.get(content, ['package', 'metadata'], []);
                        tocID = lodash_1.default.get(content, ['package', 'spine', 0, '$', 'toc'], 'toc.xhtml');
                        tocPath = (lodash_1.default.find(manifest, { id: tocID }) || {}).href;
                        if (!tocPath) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._resolveXMLAsJsObject(tocPath)];
                    case 3:
                        toc = _a.sent();
                        this._toc = toc;
                        this.structure = this._genStructure(toc);
                        _a.label = 4;
                    case 4:
                        this._manifest = manifest;
                        this._content = content;
                        this._opfPath = opfPath;
                        this._spine = this._getSpine();
                        this._metadata = metadata;
                        this.info = parseMetadata(metadata);
                        this.sections = this._resolveSectionsFromSpine(expand);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return Epub;
}());
exports.Epub = Epub;
function parserWrapper(target, options) {
    if (options === void 0) { options = {}; }
    // seems 260 is the length limit of old windows standard
    // so path length is not used to determine whether it's path or binary string
    // the downside here is that if the filepath is incorrect, it will be treated as binary string by default
    // but it can use options to define the target type
    var type = options.type, expand = options.expand;
    var _target = target;
    if (type === 'path' || (typeof target === 'string' && fs_1.default.existsSync(target))) {
        _target = fs_1.default.readFileSync(target, 'binary');
    }
    return new Epub(_target).parse(expand);
}
exports.default = parserWrapper;
//# sourceMappingURL=parseEpub.js.map